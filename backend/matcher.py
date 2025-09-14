# matcher.py
from utils import save_upload_to_temp, extract_text_from_path, clean_whitespace, chunk_text
from model_utils import load_embedder, load_cross_encoder, embed_texts, build_faiss_index, search_faiss
from recommender import suggest_missing_skills, generate_bullet_rewrites, prioritized_learning_plan
import spacy
import re
import numpy as np
from collections import defaultdict

nlp = spacy.load("en_core_web_sm", disable=["parser"])

# load models (lazy)
EMBEDDER = load_embedder()
CROSS_ENCODER = load_cross_encoder()

def expand_acronyms_via_llm(text, generator=None):
    """Use LLM generator to expand acronyms. If generator fails, return original text."""
    try:
        from model_utils import load_generator
        gen = generator or load_generator()
        prompt = f"Expand acronyms and shortforms in the following professional resume text (keep everything else same):\n\n{text}"
        out = gen(prompt, max_length=512, do_sample=False)[0]['generated_text']
        return out
    except Exception:
        return text

def extract_skills_dynamic(text):
    """Extract skills using spaCy + lightweight heuristics + LLM fallback."""
    doc = nlp(text.lower())
    cand = set()
    # Named entities and noun chunks heuristics
    for ent in doc.ents:
        if ent.label_ in ("ORG", "PRODUCT", "NORP", "WORK_OF_ART"):
            cand.add(ent.text.strip().lower())
    for nc in doc.noun_chunks:
        t = nc.text.strip().lower()
        if 2 <= len(t) <= 40 and len(t.split()) <= 4:
            cand.add(t)
    # simple common skills via regex (not hardcoded as list — but typical detection)
    simple_patterns = [r"\bpython\b", r"\bpytorch\b", r"\btensorflow\b", r"\bsql\b", r"\baws\b", r"\bdocker\b", r"\bkubernetes\b", r"\bmachine learning\b", r"\bdeep learning\b", r"\bnlp\b"]
    for p in simple_patterns:
        if re.search(p, text, re.I):
            cand.add(re.sub(r"[\\b]", "", p).strip().lower())
    # LLM fallback to extract concise skills
    try:
        from model_utils import load_generator
        gen = load_generator()
        prompt = f"List the technical and soft skills, comma separated, present in this text:\n\n{text}"
        out = gen(prompt, max_length=180, do_sample=False)[0]['generated_text']
        extracted = [s.strip().lower() for s in re.split(r",|\n|;", out) if s.strip()]
        cand.update(extracted)
    except Exception:
        pass
    # clean and filter
    clean = set()
    for s in cand:
        s2 = re.sub(r"[^a-z0-9\+\#\.\s\-]", "", s.lower()).strip()
        if len(s2) > 1 and len(s2.split()) <= 4:
            clean.add(s2)
    return sorted(list(clean))

def extract_experience_years(text):
    """Return years of experience mentioned (best-effort)."""
    m = re.findall(r"(\d{1,2})\+?\s*(?:years|yrs)\b", text.lower())
    if m:
        years = max(int(x) for x in m)
        return years
    # LLM fallback
    try:
        from model_utils import load_generator
        gen = load_generator()
        prompt = f"From the following resume text, estimate how many years of professional experience the candidate has. If not clear, answer 0.\n\n{text}"
        out = gen(prompt, max_length=64, do_sample=False)[0]['generated_text']
        nums = re.findall(r"\d+", out)
        if nums:
            return int(nums[0])
    except Exception:
        pass
    return 0

def score_resume_vs_jd(resume_path, jd_text, weights=None, required_years=0, top_k_chunks=4):
    """
    Core: loads resume, chunks it, builds embeddings, finds top matching resume chunks for the JD,
    reranks using cross-encoder for accuracy, computes features and recommendations.
    """
    if weights is None:
        weights = {"skills": 0.35, "semantic": 0.45, "experience": 0.20}

    raw = extract_text_from_path(resume_path)
    raw = clean_whitespace(raw)
    raw_expanded = expand_acronyms_via_llm(raw)
    jd_expanded = expand_acronyms_via_llm(jd_text)

    # chunk resume and JD
    resume_chunks = chunk_text(raw_expanded, max_words=90, overlap=20)
    jd_chunks = chunk_text(jd_expanded, max_words=60, overlap=10)

    # embed resume chunks and JD chunks
    resume_embs = embed_texts(resume_chunks, model=EMBEDDER)
    jd_embs = embed_texts(jd_chunks, model=EMBEDDER)

    # build faiss index for resume chunks
    index = build_faiss_index(resume_embs)

    # for each JD chunk, find top-k resume chunks (semantic search)
    jd_to_resume_hits = []
    for j_emb in jd_embs:
        D, I = search_faiss(index, j_emb.reshape(-1), top_k=top_k_chunks)
        jd_to_resume_hits.append(list(zip(I.tolist(), D.tolist())))

    # Flatten candidate pairs and rerank with cross-encoder
    pair_list = []
    pair_indices = []
    for j_idx, hits in enumerate(jd_to_resume_hits):
        for (r_idx, score) in hits:
            pair_list.append((jd_chunks[int(j_idx)][:512], resume_chunks[int(r_idx)][:512]))
            pair_indices.append((j_idx, r_idx))
    # cross-encoder scoring (more accurate)
    cross_scores = CROSS_ENCODER.predict(pair_list, show_progress_bar=False) if pair_list else []
    # aggregate scores per resume chunk and per JD chunk
    per_resume_scores = defaultdict(list)
    per_jd_scores = defaultdict(list)
    for (j_idx, r_idx), cs in zip(pair_indices, cross_scores):
        per_resume_scores[r_idx].append(float(cs))
        per_jd_scores[j_idx].append(float(cs))

    # semantic_score: average top cross scores across JD chunks (normalized)
    jd_scores_avg = [ (max(per_jd_scores.get(i, [0])) if per_jd_scores.get(i) else 0.0) for i in range(len(jd_chunks)) ]
    semantic_score = float(np.mean(jd_scores_avg))  # typically between 0..some; CrossEncoder is unbounded - normalize below

    # normalize semantic_score to 0..1 using sigmoid-like mapping
    semantic_norm = 1 / (1 + np.exp(- (semantic_score - 2)))  # tune offset for sensible range

    # skills & experience
    resume_skills = extract_skills_dynamic(raw_expanded)
    jd_skills = extract_skills_dynamic(jd_expanded)
    skill_overlap = len(set(resume_skills) & set(jd_skills)) / (len(set(jd_skills)) + 1e-6)
    years = extract_experience_years(raw_expanded)
    exp_match = min(years / max(1, required_years), 1.0) if required_years else min(years / max(1, years), 1.0)

    # final weighted score
    final = (weights["skills"] * skill_overlap) + (weights["semantic"] * semantic_norm) + (weights["experience"] * exp_match)
    final_pct = round(float(final) * 100, 2)

    # build alignment snippets: for top matched pairs show JD snippet, resume snippet, and cross score
    top_pairs_idx = np.argsort(cross_scores)[-12:] if cross_scores else []
    matches = []
    for idx in reversed(top_pairs_idx):
        j_idx, r_idx = pair_indices[idx]
        j_idx = int(j_idx)
        r_idx = int(r_idx)
        matches.append({
            "jd_snippet": jd_chunks[j_idx],
            "resume_snippet": resume_chunks[r_idx],
            "score": round(float(cross_scores[idx]), 3)
        })
        if len(matches) >= 8:
            break

    # recommendations via recommender module
    dj_skills = jd_skills
    missing_skill_lines = suggest_missing_skills(dj_skills if dj_skills else [], resume_skills=resume_skills)
    missing_skills_list = list(set(dj_skills if dj_skills else []) - set(resume_skills))
    bullet_suggestions = {}
    sample_context = " ".join(resume_chunks[:2]) if resume_chunks else raw_expanded[:800]
    for ms in missing_skills_list[:6]:
        bullet_suggestions[ms] = generate_bullet_rewrites(ms)

    learning_plan = prioritized_learning_plan(missing_skills_list) if missing_skills_list else ""

    return {
        "candidate_path": resume_path,
        "final_score_pct": final_pct,
        "semantic_score_norm": round(float(semantic_norm) * 100, 2),
        "skill_overlap_pct": round(float(skill_overlap) * 100, 2),
        "years_experience": years,
        "experience_match_pct": round(float(exp_match) * 100, 2),
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "top_matches": matches,
        "missing_skills_ranked": missing_skill_lines,
        "bullet_suggestions": bullet_suggestions,
        "learning_plan": learning_plan,
        "resume_preview": raw_expanded[:4000]
    }