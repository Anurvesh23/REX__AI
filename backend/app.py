# app.py
import streamlit as st
from utils import save_upload_to_temp
from matcher import score_resume_vs_jd
import pandas as pd
import altair as alt
import os
import tempfile
import time

st.set_page_config(page_title="RexAI — Advanced Resume–JD Analyzer", layout="wide")
st.title("RexAI — Advanced Resume–JD Analyzer ⚡")

with st.expander("⚙️ Notes / Pre-reqs", expanded=False):
    st.write("""
    • This app uses local models (sentence-transformers, cross-encoder, LLM generator).  
    • First run will download models (internet required).  
    • Ensure PyTorch >= 2.1 is installed and TensorFlow/Keras removed to avoid conflicts.
    """)

# Sidebar controls
st.sidebar.header("Analysis Controls")
required_years = st.sidebar.number_input("Required years", min_value=0, value=2)
w_skills = st.sidebar.slider("Skills weight", 0.0, 1.0, 0.35)
w_sem = st.sidebar.slider("Semantic weight", 0.0, 1.0, 0.45)
w_exp = st.sidebar.slider("Experience weight", 0.0, 1.0, 0.20)
normalize_weights = w_skills + w_sem + w_exp
if normalize_weights <= 0:
    st.sidebar.error("Weights must sum > 0")
weights = {"skills": w_skills/normalize_weights, "semantic": w_sem/normalize_weights, "experience": w_exp/normalize_weights}

st.sidebar.markdown("---")
st.sidebar.info("Tip: Increase semantic weight for deeper contextual matches; increase skills weight to favor explicit skill overlap.")

# Input area
st.subheader("1) Paste Job Description")
jd_text = st.text_area("Paste full job description here", height=220)

st.subheader("2) Upload resumes (multiple allowed)")
uploaded = st.file_uploader("Upload PDF / DOCX / TXT resumes", type=["pdf", "docx", "txt"], accept_multiple_files=True)

analyze_btn = st.button("🔎 Analyze")

if analyze_btn:
    if not jd_text or not uploaded:
        st.error("Please provide a job description and at least one resume.")
    else:
        st.info("Processing — this may take a minute for many resumes. Models are cached after first load.")
        results = []
        tmpfiles = []
        start_time = time.time()
        for u in uploaded:
            tmp_path = save_upload_to_temp(u)
            tmpfiles.append(tmp_path)
            try:
                r = score_resume_vs_jd(tmp_path, jd_text, weights=weights, required_years=required_years)
                r["candidate"] = os.path.basename(tmp_path)
                results.append(r)
            except Exception as e:
                st.error(f"Failed to process {u.name}: {e}")

        # sort by final_score_pct
        df = pd.DataFrame([{
            "candidate": r["candidate"],
            "final_score": r["final_score_pct"],
            "semantic": r["semantic_score_norm"],
            "skills": r["skill_overlap_pct"],
            "experience": r["experience_match_pct"],
            "years": r["years_experience"]
        } for r in results]).sort_values("final_score", ascending=False).reset_index(drop=True)

        st.subheader("📋 Leaderboard")
        st.dataframe(df, use_container_width=True)

        st.subheader("📈 Score Comparison")
        chart = alt.Chart(df).transform_fold(
            ["final_score", "semantic", "skills", "experience"],
            as_=['metric', 'value']
        ).mark_bar().encode(
            x='candidate:N',
            y=alt.Y('value:Q', title='Percentage'),
            color='metric:N',
            tooltip=['candidate', 'metric', 'value']
        ).properties(height=350)
        st.altair_chart(chart, use_container_width=True)

        # show best candidate deep-dive
        if results:
            best = sorted(results, key=lambda x: x["final_score_pct"], reverse=True)[0]
            st.subheader(f"🏆 Best Match — {best['candidate']} ({best['final_score_pct']}%)")

            col1, col2 = st.columns([2,1])
            with col1:
                st.markdown("**Resume Preview (expanded acronyms)**")
                st.text_area("Resume preview", value=best["resume_preview"], height=300)

                st.markdown("**Top snippet alignments (JD ↔ Resume)**")
                for m in best["top_matches"][:6]:
                    st.markdown(f"- **JD snippet:** {m['jd_snippet'][:200]}...")
                    st.markdown(f"  - Resume: {m['resume_snippet'][:200]}...  (score {m['score']})")
                    st.markdown("---")

            with col2:
                st.metric("Final Score", f"{best['final_score_pct']}%")
                st.metric("Semantic", f"{best['semantic_score_norm']}%")
                st.metric("Skill Overlap", f"{best['skill_overlap_pct']}%")
                st.metric("Experience Match", f"{best['experience_match_pct']}%")
                st.markdown("**Extracted Resume Skills**")
                st.write(best["resume_skills"][:60])
                st.markdown("**Extracted JD Skills**")
                st.write(best["jd_skills"][:60])

                st.markdown("**Missing skills prioritized (LLM)**")
                for ln in best["missing_skills_ranked"][:8]:
                    st.write("-", ln)

                st.markdown("**Top suggested bullet points (for missing skills)**")
                for skill, bullets in best["bullet_suggestions"].items():
                    st.write(f"**{skill}**")
                    for b in bullets:
                        st.write("-", b)

                st.markdown("**3-Month Prioritized Learning Plan (LLM)**")
                st.write(best["learning_plan"][:1000] + ("..." if len(best["learning_plan"])>1000 else ""))

        # cleanup temp files
        for p in tmpfiles:
            try:
                os.remove(p)
            except:
                pass

        st.success(f"Analysis done in {round(time.time()-start_time,2)}s")
