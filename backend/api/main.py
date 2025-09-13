from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fpdf import FPDF
import tempfile
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from matcher import score_resume_vs_jd
from utils import save_upload_to_temp
import shutil


# Cover Letter Generation Endpoint



# Single FastAPI app initialization
app = FastAPI()

# Cover Letter Generation Endpoint
@app.post("/generate-cover-letter/")
async def generate_cover_letter(data: dict = Body(...)):
    resume = data.get("resume", "")
    job_description = data.get("job_description", "")
    # Mocked cover letter generation
    cover_letter = f"""Dear Hiring Manager,\n\nI am excited to apply for this position. My experience as described in my resume ({resume[:40]}...) aligns well with your job requirements ({job_description[:40]}...). I am confident I would be a valuable addition to your team.\n\nThank you for considering my application.\n\nBest regards,\nJohn Doe"""
    return {"cover_letter": cover_letter}

# Save Analysis Endpoint
@app.post("/save-analysis/")
async def save_analysis(data: dict = Body(...)):
    # Here you would save the analysis to a database or file
    # For now, just return a success message
    return {"status": "success", "message": "Analysis saved (mocked)."}

# AI PDF Generation Endpoint
@app.post("/generate-pdf/")
async def generate_pdf(analysis: dict):
    # Create a temporary PDF file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf_path = tmp.name
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=14)
    pdf.cell(200, 10, txt="AI Resume Analysis Report", ln=True, align="C")
    pdf.set_font("Arial", size=10)
    pdf.ln(10)
    # Add analysis details
    def safe_text(text):
        # Replace non-latin1 characters with '?'
        if not isinstance(text, str):
            text = str(text)
        return text.encode('latin-1', 'replace').decode('latin-1')

    def add_section(title, content):
        pdf.set_font("Arial", style="B", size=11)
        pdf.cell(0, 8, txt=safe_text(title), ln=True)
        pdf.set_font("Arial", size=10)
        if isinstance(content, list):
            for item in content:
                pdf.multi_cell(0, 6, safe_text(f"- {item}"))
        elif isinstance(content, dict):
            for k, v in content.items():
                pdf.multi_cell(0, 6, safe_text(f"{k}: {v}"))
        else:
            pdf.multi_cell(0, 6, safe_text(content))
        pdf.ln(2)
    # Main fields
    add_section("Candidate", analysis.get("candidate", "N/A"))
    add_section("Overall Score", analysis.get("overall_score", "N/A"))
    add_section("Job Match", analysis.get("job_match", "N/A"))
    add_section("ATS Score", analysis.get("ats_score", "N/A"))
    add_section("Skills Match", analysis.get("skills_match", "N/A"))
    add_section("Experience Match", analysis.get("experience_match", "N/A"))
    add_section("Education Match", analysis.get("education_match", "N/A"))
    add_section("Strengths", analysis.get("strengths", []))
    add_section("Weaknesses", analysis.get("weaknesses", []))
    add_section("Suggestions", [f'{s.get("title")}: {s.get("description")}' for s in analysis.get("suggestions", [])])
    add_section("Keywords Matched", analysis.get("keywords_matched", []))
    add_section("Keywords Missing", analysis.get("keywords_missing", []))
    add_section("Relevant Sections", analysis.get("relevant_sections", {}))
    add_section("Resume Preview", analysis.get("resume_preview", ""))
    add_section("Top Matches", [f'JD: {m.get("jd_snippet")} | Resume: {m.get("resume_snippet")} | Score: {m.get("score")}' for m in analysis.get("top_matches", [])])
    add_section("Bullet Suggestions", analysis.get("bullet_suggestions", {}))
    add_section("Learning Plan", analysis.get("learning_plan", ""))
    pdf.output(pdf_path)
    return FileResponse(pdf_path, filename="AI_Resume_Analysis.pdf", media_type="application/pdf")

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
def analyze_resume(
    jd_text: str = Form(...),
    required_years: int = Form(2),
    w_skills: float = Form(0.35),
    w_sem: float = Form(0.45),
    w_exp: float = Form(0.2),
    file: UploadFile = File(...),
):
    # MOCKED RESPONSE for instant testing, now with all fields expected by frontend
    return {
        "candidate": file.filename,
        "overall_score": 91,
        "job_match": 93,
        "ats_score": 89,
        "skills_match": 88,
        "experience_match": 85,
        "education_match": None,
        "final_score_pct": 92,
        "semantic_score_norm": 90,
        "skill_overlap_pct": 88,
        "experience_match_pct": 85,
        "years_experience": 3,
        "resume_preview": "John Doe\nSoftware Engineer\n5+ years experience in Python, React, SQL\nCertified Scrum Master\n...",
        "top_matches": [
            {"jd_snippet": jd_text[:50], "resume_snippet": "Relevant experience in Python and React projects.", "score": 0.95},
            {"jd_snippet": "Experience with SQL databases", "resume_snippet": "Worked with SQL for 3 years.", "score": 0.91}
        ],
        "resume_skills": ["python", "react", "sql", "scrum"],
        "jd_skills": ["python", "react", "sql", "aws", "docker"],
        "missing_skills_ranked": ["aws", "docker"],
        "bullet_suggestions": {
            "aws": ["Completed AWS certification.", "Add AWS project experience."],
            "docker": ["Learn Docker basics.", "Add Docker to your skills section."]
        },
        "learning_plan": "- Study AWS fundamentals\n- Complete AWS projects\n- Take Docker online course\n- Add Docker to resume",
        "strengths": [
            "Strong experience with Python and React",
            "Good SQL knowledge",
            "Relevant work experience for the role",
            "Certified Scrum Master"
        ],
        "weaknesses": [
            "Missing AWS experience",
            "No Docker experience",
            "No recent certifications listed"
        ],
        "suggestions": [
            {
                "type": "improvement",
                "title": "Add AWS Experience",
                "description": "Consider adding AWS-related projects or certifications.",
                "impact": "High",
                "category": "skills"
            },
            {
                "type": "improvement",
                "title": "Learn Docker",
                "description": "Learning Docker will make your profile more competitive.",
                "impact": "Medium",
                "category": "skills"
            },
            {
                "type": "warning",
                "title": "Update Certifications",
                "description": "List any recent certifications to strengthen your profile.",
                "impact": "Medium",
                "category": "certifications"
            },
            {
                "type": "success",
                "title": "Strong Technical Stack",
                "description": "Your technical stack matches most job requirements.",
                "impact": "Positive",
                "category": "skills"
            }
        ],
        "keywords_matched": ["python", "react", "sql", "scrum"],
        "keywords_missing": ["aws", "docker"],
        "relevant_sections": {
            "skills": True,
            "experience": True,
            "education": False,
            "certifications": True
        }
    }
