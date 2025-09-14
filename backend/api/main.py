from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fpdf import FPDF
import tempfile
import sys
import os
import json
import google.generativeai as genai
import shutil
from dotenv import load_dotenv

# --- Gemini AI Integration ---
# This loads your API key from the .env file in your backend folder
load_dotenv()

try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"FATAL: Error configuring Gemini AI. Please check your GOOGLE_API_KEY. Error: {e}")
# -------------------------

# Add the parent directory to the system path to allow module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from matcher import score_resume_vs_jd
from utils import save_upload_to_temp

# Single FastAPI app initialization
app = FastAPI()

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Mock Interview Endpoints (with Gemini AI) ---

@app.post("/interview/start/")
async def start_interview(data: dict = Body(...)):
    role = data.get("role", "Software Developer")
    difficulty = data.get("difficulty", "Medium")
    num_questions = data.get("num_questions", 5)

    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Generate {num_questions} interview questions for a '{role}' role at a '{difficulty}' difficulty level.
        The questions should cover a mix of technical and behavioral aspects.
        Return the response as a valid JSON array of objects, where each object has the following structure:
        {{
          "id": number,
          "question": "string",
          "category": "technical" | "behavioral",
          "difficulty": "{difficulty}"
        }}
        Do not include markdown formatting like ```json in your response.
        """
        response = model.generate_content(prompt)
        
        # Clean up the response to handle potential markdown backticks
        json_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        questions = json.loads(json_response_text)
        return {"questions": questions}

    except Exception as e:
        print(f"Error calling Gemini API for questions: {e}")
        return JSONResponse(status_code=500, content={"message": "Failed to generate questions from AI."})


@app.post("/interview/evaluate/")
async def evaluate_answer(data: dict = Body(...)):
    question = data.get("question")
    answer = data.get("answer")

    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        You are an expert interviewer. Evaluate the candidate's answer to the interview question.

        **Interview Question:** "{question}"
        **Candidate's Answer:** "{answer}"

        **Your Task:**
        Provide a score from 1-10 and a short, constructive feedback paragraph.
        Return the result as a valid JSON object with the following structure:
        {{
          "score": number,
          "feedback": "string"
        }}
        Do not include markdown formatting like ```json in your response.
        """
        response = model.generate_content(prompt)

        # Clean up the response to handle potential markdown backticks
        json_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        evaluation = json.loads(json_response_text)
        return evaluation

    except Exception as e:
        print(f"Error calling Gemini API for evaluation: {e}")
        return JSONResponse(status_code=500, content={"message": "Failed to evaluate answer with AI."})


# --- Existing Endpoints ---

@app.post("/generate-cover-letter/")
async def generate_cover_letter(data: dict = Body(...)):
    resume = data.get("resume", "")
    job_description = data.get("job_description", "")
    # Mocked cover letter generation
    cover_letter = f"""Dear Hiring Manager,\n\nI am excited to apply for this position. My experience as described in my resume ({resume[:40]}...) aligns well with your job requirements ({job_description[:40]}...). I am confident I would be a valuable addition to your team.\n\nThank you for considering my application.\n\nBest regards,\nJohn Doe"""
    return {"cover_letter": cover_letter}


@app.post("/save-analysis/")
async def save_analysis(data: dict = Body(...)):
    # In a real application, you would save the analysis to a database.
    print("Received analysis to save:", data)
    return {"status": "success", "message": "Analysis saved (mocked)."}


@app.post("/generate-pdf/")
async def generate_pdf(analysis: dict):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf_path = tmp.name
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=14)
    pdf.cell(200, 10, txt="AI Resume Analysis Report", ln=True, align="C")
    pdf.set_font("Arial", size=10)
    pdf.ln(10)

    def safe_text(text):
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

    add_section("Candidate", analysis.get("candidate", "N/A"))
    add_section("Overall Score", analysis.get("overall_score", "N/A"))
    # ... (add other sections as needed) ...
    
    pdf.output(pdf_path)
    return FileResponse(pdf_path, filename="AI_Resume_Analysis.pdf", media_type="application/pdf")


@app.post("/analyze/")
def analyze_resume(
    jd_text: str = Form(...),
    required_years: int = Form(2),
    w_skills: float = Form(0.35),
    w_sem: float = Form(0.45),
    w_exp: float = Form(0.2),
    file: UploadFile = File(...),
):
    # This remains mocked as per your original code
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
        "resume_preview": "John Doe\nSoftware Engineer\n5+ years experience...",
        "top_matches": [
            {"jd_snippet": jd_text[:50], "resume_snippet": "Relevant experience...", "score": 0.95}
        ],
        "resume_skills": ["python", "react", "sql"],
        "jd_skills": ["python", "react", "aws"],
        "missing_skills_ranked": ["aws"],
        "bullet_suggestions": {
            "aws": ["Consider an AWS certification."]
        },
        "learning_plan": "- Study AWS fundamentals.",
        "strengths": ["Strong Python and React skills."],
        "weaknesses": ["Missing AWS experience."],
        "suggestions": [
            {
                "type": "improvement",
                "title": "Add AWS Experience",
                "description": "Consider adding AWS projects.",
                "impact": "High",
                "category": "skills"
            }
        ],
        "keywords_matched": ["python", "react"],
        "keywords_missing": ["aws"],
        "relevant_sections": {
            "skills": True,
            "experience": True,
            "education": False,
            "certifications": False
        }
    }