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
# This will now work because the spacy model is downloaded.
from matcher import score_resume_vs_jd
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

# --- AI Skill Test Endpoints ---

@app.post("/interview/start/")
async def start_skill_test(data: dict = Body(...)):
    role = data.get("role", "Software Developer")
    difficulty = data.get("difficulty", "Medium")
    num_questions = data.get("num_questions", 10)

    try:
        # --- THIS IS THE FIX ---
        # Updated the model name to the latest, correct version
        model = genai.GenerativeModel('gemini-1.5-flash')
        # ---------------------

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
    required_years: int = Form(2),
    w_skills: float = Form(0.35),
    w_sem: float = Form(0.45),
    w_exp: float = Form(0.2),
    file: UploadFile = File(...),
):
    try:
        temp_path = save_upload_to_temp(file)
        
        # Extract text from the uploaded file
        resume_text = extract_text_from_path(temp_path)
        
        # Use Gemini AI for analysis
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        First, analyze this job description to identify what requirements are mentioned:

        JOB DESCRIPTION:
        {jd_text}

        Then analyze this resume against ONLY the requirements mentioned in the job description:

        RESUME:
        {resume_text}

        IMPORTANT: Only provide scores for aspects that are explicitly mentioned in the job description.
        - If skills/technologies are mentioned → include skills_match
        - If experience requirements are mentioned → include experience_match  
        - If education requirements are mentioned → include education_match
        - Always include job_match and ats_score

        Please provide a JSON response with the following structure:
        {{
          "overall_score": number (0-100),
          "skills_match": number (0-100) OR null if not mentioned in job description,
          "experience_match": number (0-100) OR null if not mentioned in job description,
          "education_match": number (0-100) OR null if not mentioned in job description,
          "job_match": number (0-100),
          "ats_score": number (0-100),
          "relevant_sections": {{
            "skills": boolean (true if job mentions specific skills/technologies),
            "experience": boolean (true if job mentions experience requirements),
            "education": boolean (true if job mentions education requirements),
            "certifications": boolean (true if job mentions certifications)
          }},
          "suggestions": [
            {{
              "type": "improvement|warning|success",
              "title": "string",
              "description": "string", 
              "impact": "High|Medium|Low|Positive",
              "category": "content|formatting|keywords|experience"
            }}
          ],
          "keywords_matched": ["array of matched keywords from job description"],
          "keywords_missing": ["array of missing keywords from job description"],
          "strengths": ["array of resume strengths relevant to this job"],
          "weaknesses": ["array of areas for improvement relevant to this job"]
        }}

        Analysis Guidelines:
        1. Skills match: Only if job mentions specific technical skills, tools, or technologies
        2. Experience match: Only if job mentions years of experience, specific roles, or industry experience
        3. Education match: Only if job mentions degree requirements, educational background, or academic qualifications
        4. Job match: Overall fit for this specific position (always include)
        5. ATS compatibility: How well will this resume pass ATS systems (always include)
        
        Be accurate and only analyze what's actually mentioned in the job description.
        """
        
        response = model.generate_content(prompt)
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        analysis_result = json.loads(json_response_text)
        
        os.remove(temp_path)
        return analysis_result
    except Exception as e:
        print(f"Error during resume analysis: {e}")
        return JSONResponse(status_code=500, content={{"message": str(e)}})