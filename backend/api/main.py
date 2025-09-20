# backend/api/main.py
from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
import uuid
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
import time

# Create a directory for temporary audio files if it doesn't exist
if not os.path.exists("temp_audio"):
    os.makedirs("temp_audio")

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

# Mount static directory to serve audio files
app.mount("/temp_audio", StaticFiles(directory="temp_audio"), name="temp_audio")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Payloads ---
class SpeakRequest(BaseModel):
    text: str

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

class AiResumePdfRequest(BaseModel):
    optimized_resume_text: str


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

def create_optimized_resume_pdf(text_content: str):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "", 10)

    lines = text_content.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            pdf.ln(3)
            continue

        if line.startswith('**') and line.endswith('**'):
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, line.strip('*'), 0, 1)
            pdf.set_font("Arial", "", 10)
        elif line.startswith('* **'):
            pdf.set_font("Arial", "B", 10)
            pdf.multi_cell(0, 5, " " + line.strip())
            pdf.set_font("Arial", "", 10)
        elif line.startswith('*'):
            pdf.multi_cell(0, 5, "   " + line)
        elif '---' in line or '===' in line:
            pdf.ln(2)
        else:
            if line.isupper() and len(line) > 5:
                 pdf.set_font("Arial", "B", 12)
                 pdf.cell(0, 10, line, 0, 1)
                 pdf.set_font("Arial", "", 10)
            else:
                pdf.multi_cell(0, 5, line)

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
        As an expert interviewer, generate {num_questions} unique and high-quality multiple-choice questions for a '{role}' position at a '{difficulty}' difficulty level. Ensure a good mix of technical and behavioral questions relevant to the role.

        **Instructions for question generation:**
        1.  **Uniqueness:** Generate entirely new questions. Avoid repeating common or easily searchable questions. Use the current timestamp ({time.time()}) to ensure freshness.
        2.  **Relevance:** Questions must be directly applicable to the '{role}' role. For technical questions, focus on practical scenarios and problem-solving. For behavioral questions, use situations a person in this role might face.
        3.  **Clarity:** Questions and options should be clear, concise, and unambiguous.
        4.  **Plausible Distractors:** Incorrect options (distractors) should be plausible but clearly incorrect to a knowledgeable candidate.
        5.  **Strict JSON Output:** Return ONLY a valid JSON array of objects. Do not include any introductory text, markdown formatting like ```json, or any other text outside of the JSON structure.

        **JSON Object Structure (per question):**
        ```json
        {{
          "id": "A unique integer for each question",
          "question": "The full text of the question.",
          "category": "technical or behavioral",
          "difficulty": "{difficulty}",
          "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          "correctAnswer": "The exact string of the correct option from the 'options' array."
        }}
        ```

        **Example for a Software Developer role:**
        *Technical Question Idea:* "A user reports that a web page is loading slowly. What is the most likely bottleneck to investigate first: database query performance, frontend rendering, network latency, or server-side code execution?"
        *Behavioral Question Idea:* "Describe a time you disagreed with a technical decision made by your team lead. How did you handle it, and what was the outcome?"

        Now, generate the {num_questions} questions following these rules precisely.
        """
        response = model.generate_content(prompt)
        # Clean the response to ensure it's valid JSON
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()

        # Attempt to parse the JSON, with error handling
        try:
            questions = json.loads(json_response_text)
            # Ensure the response is a list
            if not isinstance(questions, list):
                raise ValueError("AI response is not a JSON array.")
        except json.JSONDecodeError:
            # If parsing fails, try to find a JSON array within the response
            match = re.search(r'\[\s*\{.*\}\s*\]', json_response_text, re.DOTALL)
            if match:
                questions = json.loads(match.group(0))
            else:
                raise ValueError("No valid JSON array found in the AI response.")


        # Assign sequential IDs for consistency
        for i, q in enumerate(questions):
            q['id'] = i + 1

        return {"questions": questions}

    except Exception as e:
        print(f"Error calling Gemini API for questions: {e}")
        # Provide a more detailed error response to the frontend
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred while generating AI questions: {str(e)}"}
        )

# NEW Endpoint for Text-to-Speech
@app.post("/interview/speak/")
async def speak_text(request: SpeakRequest):
    try:
        tts = gTTS(text=request.text, lang='en', tld='co.in', slow=False)
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("temp_audio", filename)
        tts.save(filepath)

        # In a production app, you'd return a full URL
        # For local dev, this relative path works with the static mount
        audio_url = f"/temp_audio/{filename}"
        return {"audio_url": audio_url}
    except Exception as e:
        print(f"Error generating speech: {e}")
        return JSONResponse(status_code=500, content={"message": str(e)})


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
        **Objective:** Analyze the provided resume against the job description with high accuracy and provide a detailed, structured JSON response.

        **Context:**
        - **Job Description:** {jd_text}
        - **Resume:** {resume_text}

        **Instructions for Analysis:**
        1.  **Scoring:**
            -   **skills_match, experience_match, education_match:** Only provide a score (0-100) if the job description explicitly mentions requirements for that category. Otherwise, the value must be `null`.
            -   **job_match:** An overall compatibility score (0-100) for this specific role.
            -   **ats_score:** An estimate (0-100) of how well the resume is optimized for Applicant Tracking Systems (ATS). Consider formatting, keywords, and structure.
            -   **overall_score:** A weighted average of the other scores, reflecting the overall strength of the application.
        2.  **Relevant Sections:** Identify which of the following sections are explicitly mentioned as requirements in the job description: `skills`, `experience`, `education`, `certifications`.
        3.  **Suggestions:** Provide a minimum of 5 actionable suggestions for improvement. Each suggestion must have a clear `type`, `title`, `description`, `impact` (High, Medium, Low), and `category`.
        4.  **Keywords:** Extract and list the keywords from the job description that are present in the resume (`keywords_matched`) and those that are not (`keywords_missing`). Be thorough.
        5.  **Strengths & Weaknesses:** Identify at least 3 key strengths and 3 areas for improvement based on the comparison.

        **Required JSON Output Structure (Do not include any text or markdown formatting outside of this JSON object):**
        ```json
        {{
          "overall_score": number,
          "skills_match": number | null,
          "experience_match": number | null,
          "education_match": number | null,
          "job_match": number,
          "ats_score": number,
          "relevant_sections": {{
            "skills": boolean,
            "experience": boolean,
            "education": boolean,
            "certifications": boolean
          }},
          "suggestions": [
            {{
              "type": "improvement" | "warning" | "success",
              "title": "string",
              "description": "string",
              "impact": "High" | "Medium" | "Low",
              "category": "Content" | "Formatting" | "Keywords" | "Experience"
            }}
          ],
          "keywords_matched": ["string"],
          "keywords_missing": ["string"],
          "strengths": ["string"],
          "weaknesses": ["string"]
        }}
        ```
        """

        response = model.generate_content(prompt)
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        analysis_result = json.loads(json_response_text)

        os.remove(temp_path)
        return analysis_result
    except Exception as e:
        print(f"Error during resume analysis: {e}")
        return JSONResponse(status_code=500, content={"message": str(e)})

# --- Additional Endpoints ---

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

@app.post("/generate-ai-resume-pdf/")
async def generate_ai_resume_pdf(request: AiResumePdfRequest):
    try:
        pdf_path = create_optimized_resume_pdf(request.optimized_resume_text)
        return FileResponse(pdf_path, media_type='application/pdf', filename='AI_Optimized_Resume.pdf')
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@app.post("/save-analysis/")
async def save_analysis(data: dict = Body(...)):
    print("Received data to save:", data.get("overall_score"))
    return {"message": "Analysis saved successfully!"}