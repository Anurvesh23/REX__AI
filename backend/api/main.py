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

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from matcher import score_resume_vs_jd
from utils import save_upload_to_temp

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
        weights = {"skills": w_skills, "semantic": w_sem, "experience": w_exp}
        analysis_result = score_resume_vs_jd(
            resume_path=temp_path,
            jd_text=jd_text,
            weights=weights,
            required_years=required_years
        )
        os.remove(temp_path)
        return analysis_result
    except Exception as e:
        print(f"Error during resume analysis: {e}")
        return JSONResponse(status_code=500, content={"message": str(e)})

