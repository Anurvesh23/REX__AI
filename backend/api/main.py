from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fpdf import FPDF
import tempfile
import sys
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import docx2txt
import fitz  # PyMuPDF
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# --- Gemini AI Integration ---
load_dotenv()
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
    print("--- Gemini AI configured successfully. ---")
except Exception as e:
    print(f"FATAL: Error configuring Gemini AI. Please check your GOOGLE_API_KEY. Error: {e}")
# -------------------------

# Add the parent directory to the system path to allow module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# --- Re-enabled Imports for Resume Analyzer ---
from utils import save_upload_to_temp, extract_text_from_path
# ---------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Payloads ---
class CoverLetterRequest(BaseModel):
    resume: str
    job_description: str

class PDFRequest(BaseModel):
    overall_score: int
    skills_match: Optional[int] = None
    experience_match: Optional[int] = None
    education_match: Optional[int] = None
    job_match: int
    ats_score: int
    suggestions: List[Dict[str, Any]]
    keywords_matched: List[str]
    keywords_missing: List[str]
    strengths: List[str]
    weaknesses: List[str]

# --- PDF Generation Helper ---
def create_analysis_pdf(data: dict):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Rex--AI Resume Analysis Report", 0, 1, "C")
    pdf.ln(10)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Overall Match Score: {data.get('overall_score', 'N/A')}/100", 0, 1)
    pdf.ln(5)

    pdf.set_font("Arial", "B", 10)
    def add_section(title, items):
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, title, 0, 1)
        pdf.set_font("Arial", "", 10)
        if items:
            for item in items:
                pdf.multi_cell(0, 5, f"- {item}")
        else:
            pdf.multi_cell(0, 5, "- None found.")
        pdf.ln(5)

    add_section("Key Strengths", data.get("strengths", []))
    add_section("Areas for Improvement", data.get("weaknesses", []))
    add_section("Matched Keywords", data.get("keywords_matched", []))
    add_section("Missing Keywords", data.get("keywords_missing", []))

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "AI Suggestions", 0, 1)
    pdf.set_font("Arial", "", 10)
    for sug in data.get("suggestions", []):
        pdf.set_font("Arial", "B", 10)
        pdf.multi_cell(0, 5, f"[{sug.get('impact', '')}] {sug.get('title', '')}")
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 5, sug.get('description', ''))
        pdf.ln(2)

    _, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    pdf.output(temp_pdf_path)
    return temp_pdf_path


# --- AI Skill Test Endpoints ---

@app.post("/interview/start/")
async def start_skill_test(data: dict = Body(...)):
    role = data.get("role", "Software Developer")
    difficulty = data.get("difficulty", "Medium")
    num_questions = data.get("num_questions", 10)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Generate {num_questions} multiple-choice technical skill test questions for a '{role}' role at a '{difficulty}' difficulty level.

        Return ONLY a valid JSON array of objects. Do not include any other text or markdown formatting like ```json.
        Each object in the array must have the following exact structure:
        {{
          "id": number,
          "question": "The question text.",
          "category": "technical",
          "difficulty": "{difficulty}",
          "options": ["string for option A", "string for option B", "string for option C", "string for option D"],
          "correctAnswer": "The exact string of the correct option from the 'options' array."
        }}
        """
        response = model.generate_content(prompt)
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        questions = json.loads(json_response_text)
        
        for i, q in enumerate(questions):
            q['id'] = i + 1

        return {"questions": questions}

    except Exception as e:
        print(f"Error calling Gemini API for questions: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Failed to generate or parse AI response. Error: {str(e)}"}
        )

# --- Resume Analyzer Endpoint ---

@app.post("/analyze/")
def analyze_resume(
    jd_text: str = Form(...),
    file: UploadFile = File(...),
):
    try:
        temp_path = save_upload_to_temp(file)
        resume_text = extract_text_from_path(temp_path)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze the provided resume against the job description. Provide a JSON response with the specified structure.
        JOB DESCRIPTION: {jd_text}
        RESUME: {resume_text}
        
        Provide scores only for aspects explicitly mentioned in the job description (e.g., if education isn't mentioned, "education_match" should be null).
        Always include "job_match" and "ats_score".
        
        JSON STRUCTURE:
        {{
          "overall_score": number (0-100),
          "skills_match": number (0-100) or null,
          "experience_match": number (0-100) or null,
          "education_match": number (0-100) or null,
          "job_match": number (0-100),
          "ats_score": number (0-100),
          "relevant_sections": {{ "skills": boolean, "experience": boolean, "education": boolean, "certifications": boolean }},
          "suggestions": [{{ "type": "...", "title": "...", "description": "...", "impact": "...", "category": "..." }}],
          "keywords_matched": ["..."],
          "keywords_missing": ["..."],
          "strengths": ["..."],
          "weaknesses": ["..."]
        }}
        """
        
        response = model.generate_content(prompt)
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        analysis_result = json.loads(json_response_text)
        
        os.remove(temp_path)
        return analysis_result
    except Exception as e:
        print(f"Error during resume analysis: {e}")
        return JSONResponse(status_code=500, content={"message": str(e)})

# --- NEW: Additional Endpoints ---

@app.post("/generate-cover-letter/")
async def generate_cover_letter(request: CoverLetterRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Generate a professional and compelling cover letter based on the following resume and job description.
        The cover letter should be 3-4 paragraphs, highlight relevant skills and experience, and show enthusiasm for the role.

        RESUME:
        {request.resume}

        JOB DESCRIPTION:
        {request.job_description}
        """
        response = model.generate_content(prompt)
        return {"cover_letter": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/generate-pdf/")
async def generate_pdf_report(request: PDFRequest):
    try:
        pdf_path = create_analysis_pdf(request.dict())
        return FileResponse(pdf_path, media_type='application/pdf', filename='AI_Resume_Analysis.pdf')
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/save-analysis/")
async def save_analysis(data: dict = Body(...)):
    # In a real application, you would initialize the Supabase client here
    # and insert the 'data' into your 'resumes' table.
    # from supabase import create_client, Client
    # url: str = os.environ.get("SUPABASE_URL")
    # key: str = os.environ.get("SUPABASE_SERVICE_KEY")
    # supabase: Client = create_client(url, key)
    # response = supabase.table('resumes').insert(data).execute()
    print("Received data to save:", data.get("overall_score"))
    return {"message": "Analysis saved successfully!"}