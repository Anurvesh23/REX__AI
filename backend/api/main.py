# --- Core Imports ---
import tempfile
import sys
import os
import json
import uuid
from typing import List, Optional, Dict, Any

# --- Environment and AI ---
import google.generativeai as genai
from dotenv import load_dotenv

# --- Web Framework (FastAPI) ---
from fastapi import (
    FastAPI, UploadFile, File, Form, Body, Depends, HTTPException, Header, status, Request
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# --- Security ---
import jwt
from jwt.exceptions import InvalidTokenError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- Data Models ---
from pydantic import BaseModel

# --- Utilities ---
from fpdf import FPDF
from gtts import gTTS

# --- Supabase ---
from supabase import create_client, Client

# Add parent directory to system path for local module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils import save_upload_to_temp, extract_text_from_path

# --- Environment & AI Configuration ---
load_dotenv()
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
    print("--- Gemini AI configured successfully. ---")
except Exception as e:
    print(f"FATAL: Error configuring Gemini AI. Please check your GOOGLE_API_KEY. Error: {e}")

# --- Supabase Configuration ---
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # IMPORTANT: Use Service Role Key for backend
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or Service Role Key is not set in the environment.")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("--- Supabase client configured successfully. ---")


# --- App & Middleware Setup ---
app = FastAPI(title="Rex--AI API")

# Security: Rate Limiting
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security: CORS Configuration
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    # Add your production frontend URL here, e.g., "https://your-app.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- Static Files for Audio ---
if not os.path.exists("temp_audio"):
    os.makedirs("temp_audio")
app.mount("/temp_audio", StaticFiles(directory="temp_audio"), name="temp_audio")

# --- Security: Authentication ---
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not SUPABASE_JWT_SECRET:
    raise ValueError("SUPABASE_JWT_SECRET is not set in the environment. Please add it to your .env file.")

async def get_current_user_id(authorization: str = Header(None)):
    """Dependency to extract and validate user ID from Supabase JWT."""
    if authorization is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header is missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience='authenticated')
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials, user ID is missing")
        return user_id
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials: {e}")

# --- Security: File Upload Validation ---
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
]

def validate_file(file: UploadFile):
    """Dependency to validate uploaded file type and size."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the {MAX_FILE_SIZE // 1024 // 1024} MB limit."
        )
    return file

# --- Pydantic Models ---
class SpeakRequest(BaseModel): text: str
class CoverLetterRequest(BaseModel): resume: str; job_description: str
class StartTestRequest(BaseModel): role: str; difficulty: str = "medium"; num_questions: int = 10
class AiResumePdfRequest(BaseModel): optimized_resume_text: str
class EvaluateTestRequest(BaseModel): questions: List[Dict[str, Any]]; answers: List[Dict[str, Any]]
class TestReportRequest(BaseModel): job_role: str; difficulty: str; overall_score: int; total_questions: int; correct_answers: int; duration_minutes: int; answers: List[Dict[str, Any]]; questions: List[Dict[str, Any]]
class SaveAnalysisRequest(BaseModel): overall_score: int
class AnalysisReportPDFRequest(BaseModel):
    overall_score: int
    job_match: int
    ats_score: int
    suggestions: List[Dict[str, Any]]
    keywords_matched: List[str]
    keywords_missing: List[str]
    strengths: List[str]
    weaknesses: List[str]
    skills_match: Optional[int] = None
    experience_match: Optional[int] = None
    education_match: Optional[int] = None
class OptimizeResumeRequest(BaseModel):
    resume_text: str
    job_description: str
class SaveInterviewRequest(BaseModel):
    job_role: str
    difficulty: str
    overall_score: int
    total_questions: int
    correct_answers: int
    answered_questions: int
    duration_minutes: int
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    feedback: Optional[str] = None
    suggestions: Optional[List[str]] = None
    category_scores: Optional[Dict[str, int]] = None
class SaveJobRequest(BaseModel):
    job_title: str
    company_name: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    application_status: str = "Saved"


# --- PDF Generation Helpers ---
def create_analysis_pdf(data: dict):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Rex--AI Resume Analysis Report", 0, 1, "C")
    pdf.ln(10)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Overall Match Score: {data.get('overall_score', 'N/A')}/100", 0, 1)
    pdf.ln(5)

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
    for line in text_content.split('\n'):
        line = line.strip()
        if not line:
            pdf.ln(3)
            continue
        if line.startswith('**') and line.endswith('**'):
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, line.strip('*'), 0, 1)
            pdf.set_font("Arial", "", 10)
        else:
            pdf.multi_cell(0, 5, line.encode('latin-1', 'replace').decode('latin-1'))
    _, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    pdf.output(temp_pdf_path)
    return temp_pdf_path

def create_test_report_pdf(data: TestReportRequest):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Rex--AI Mock Test Report", 0, 1, "C")
    pdf.ln(10)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Role: {data.job_role} ({data.difficulty.capitalize()})", 0, 1)
    pdf.cell(0, 10, f"Final Score: {data.overall_score}/100", 0, 1)
    pdf.ln(5)
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 8, f"Summary: {data.correct_answers} out of {data.total_questions} correct in {data.duration_minutes} minutes.", 0, 1)
    pdf.ln(10)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Answer Review", 0, 1)
    for answer_data in data.answers:
        question = next((q for q in data.questions if q['id'] == answer_data['question_id']), None)
        if not question: continue
        pdf.set_font("Arial", "B", 10)
        pdf.multi_cell(0, 5, f"Q: {question['question']}".encode('latin-1', 'replace').decode('latin-1'))
        pdf.set_font("Arial", "", 10)
        if answer_data['is_correct']:
            pdf.set_text_color(34, 139, 34)
            pdf.multi_cell(0, 5, f"  Your Answer (Correct): {answer_data.get('selected_answer', 'Skipped')}".encode('latin-1', 'replace').decode('latin-1'))
        else:
            pdf.set_text_color(220, 20, 60)
            pdf.multi_cell(0, 5, f"  Your Answer (Incorrect): {answer_data.get('selected_answer', 'Skipped')}".encode('latin-1', 'replace').decode('latin-1'))
            pdf.set_text_color(34, 139, 34)
            pdf.multi_cell(0, 5, f"  Correct Answer: {answer_data.get('correct_answer')}".encode('latin-1', 'replace').decode('latin-1'))
        pdf.set_text_color(0, 0, 0)
        pdf.ln(4)
    _, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    pdf.output(temp_pdf_path)
    return temp_pdf_path

# --- API Endpoints ---

@app.post("/analyze/")
@limiter.limit("5 per minute")
async def analyze_resume(
    request: Request,
    jd_text: str = Form(...),
    file: UploadFile = Depends(validate_file),
    user_id: str = Depends(get_current_user_id)
):
    temp_path = None
    try:
        temp_path = save_upload_to_temp(file)
        resume_text = extract_text_from_path(temp_path)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        **Objective:** Analyze the provided resume against the job description with high accuracy and provide a detailed, structured JSON response.
        **Context:**
         - **Job Description:** {jd_text}
         - **Resume:** {resume_text}
        **Required JSON Output Structure (Do not include any text or markdown formatting outside of this JSON object):**
        ```json
        {{
          "overall_score": number, "skills_match": number | null, "experience_match": number | null, "education_match": number | null, "job_match": number, "ats_score": number,
          "relevant_sections": {{"skills": boolean, "experience": boolean, "education": boolean, "certifications": boolean}},
          "suggestions": [{{"type": "improvement" | "warning" | "success", "title": "string", "description": "string", "impact": "High" | "Medium" | "Low", "category": "Content" | "Formatting" | "Keywords" | "Experience"}}],
          "keywords_matched": ["string"], "keywords_missing": ["string"], "strengths": ["string"], "weaknesses": ["string"]
        }}
        ```
        """
        response = model.generate_content(prompt)
        # Clean the response to ensure it's valid JSON
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        analysis_result = json.loads(json_response_text)
        
        return analysis_result
    except Exception as e:
        print(f"Error during resume analysis for user {user_id}: {e}")
        return JSONResponse(status_code=500, content={"message": str(e)})
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/generate-optimized-resume/")
@limiter.limit("5 per minute")
async def generate_optimized_resume(request: Request, data: OptimizeResumeRequest, user_id: str = Depends(get_current_user_id)):
    """
    Takes original resume text and a job description, and returns a fully
    rewritten, optimized version using a generative AI model.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        **Task:** You are an expert career coach and resume writer. Your task is to completely rewrite and reformat the provided resume to be professional, ATS-friendly, and highly tailored to the given job description.

        **Instructions:**
        1.  **Format:** Use a clean, professional format with clear headings (e.g., SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS). Use markdown for bolding headings.
        2.  **Content Rewrite:** Do not just copy sections. Rewrite the summary and experience bullet points to be more impactful. Use the STAR (Situation, Task, Action, Result) method and add quantifiable achievements where it makes sense based on the context.
        3.  **Keyword Integration:** Seamlessly integrate relevant skills and keywords from the job description into the summary and experience sections. Make it sound natural.
        4.  **Tone:** Maintain a professional and confident tone throughout.
        5.  **Output:** Provide ONLY the rewritten resume text. Do not include any extra commentary, notes, or explanations before or after the resume content. Start directly with the candidate's name and contact info.

        ---
        **JOB DESCRIPTION FOR TARGETING:**
        {data.job_description}
        ---
        **ORIGINAL RESUME TO REWRITE:**
        {data.resume_text}
        ---
        **PROFESSIONALLY REWRITTEN RESUME:**
        """
        response = model.generate_content(prompt)
        return {"optimized_resume_text": response.text}
    except Exception as e:
        print(f"Error during resume optimization for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate AI resume: {str(e)}")

@app.post("/generate-cover-letter/")
@limiter.limit("5 per minute")
async def generate_cover_letter(request: Request, data: CoverLetterRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Generate a professional and compelling cover letter based on the following resume and job description. The cover letter should be 3-4 paragraphs, highlight relevant skills and experience, and show enthusiasm for the role.\n\nRESUME:\n{data.resume}\n\nJOB DESCRIPTION:\n{data.job_description}"
        response = model.generate_content(prompt)
        return {"cover_letter": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/interview/start/")
@limiter.limit("5 per minute")
async def start_skill_test(request: Request, data: StartTestRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""Generate {data.num_questions} unique, high-quality, and tricky multiple-choice questions for a '{data.role}' position at a '{data.difficulty}' difficulty level. Return ONLY a valid JSON array of objects.
        **JSON Object Structure (per question):**
        ```json
        {{ "id": "A unique integer", "question": "The question text.", "category": "technical or behavioral", "difficulty": "{data.difficulty}", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "The exact string of the correct option." }}
        ```
        """
        response = model.generate_content(prompt)
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        questions = json.loads(json_response_text)
        for i, q in enumerate(questions): q['id'] = i + 1 # Ensure unique IDs
        return {"questions": questions}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error generating AI questions: {str(e)}"})

@app.post("/interview/evaluate-test/")
@limiter.limit("10 per minute")
async def evaluate_test(request: Request, data: EvaluateTestRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Analyze the results of a mock test. Provide a comprehensive analysis in a strict JSON format.
        - **Questions:** {json.dumps(data.questions)}
        - **User's Answers:** {json.dumps(data.answers)}
        **Required JSON Output Structure:**
        ```json
        {{
            "category_scores": {{"technical": number, "behavioral": number}},
            "detailed_feedback": [{{"question_id": number, "feedback": "string"}}],
            "overall_feedback": "string",
            "suggestions": ["string", "string", "string"]
        }}
        ```
        """
        response = model.generate_content(prompt)
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(json_response_text)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/interview/speak/")
@limiter.limit("20 per minute")
async def speak_text(request: Request, data: SpeakRequest, user_id: str = Depends(get_current_user_id)):
    try:
        tts = gTTS(text=data.text, lang='en', tld='co.in', slow=False)
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("temp_audio", filename)
        tts.save(filepath)
        audio_url = f"/temp_audio/{filename}" # Relative URL for the client
        return {"audio_url": audio_url}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/generate-analysis-pdf/")
@limiter.limit("10 per minute")
async def generate_analysis_pdf_report(request: Request, data: AnalysisReportPDFRequest, user_id: str = Depends(get_current_user_id)):
    try:
        pdf_path = create_analysis_pdf(data.dict())
        return FileResponse(pdf_path, media_type='application/pdf', filename='AI_Resume_Analysis.pdf')
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/generate-ai-resume-pdf/")
@limiter.limit("10 per minute")
async def generate_ai_resume_pdf(request: Request, data: AiResumePdfRequest, user_id: str = Depends(get_current_user_id)):
    try:
        pdf_path = create_optimized_resume_pdf(data.optimized_resume_text)
        return FileResponse(pdf_path, media_type='application/pdf', filename='AI_Optimized_Resume.pdf')
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/interview/generate-report-pdf/")
@limiter.limit("10 per minute")
async def generate_test_report_pdf(request: Request, data: TestReportRequest, user_id: str = Depends(get_current_user_id)):
    try:
        pdf_path = create_test_report_pdf(data)
        return FileResponse(pdf_path, media_type='application/pdf', filename=f"{data.job_role}_Mock_Test_Report.pdf")
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
        
@app.post("/save-analysis/")
@limiter.limit("10 per minute")
async def save_analysis(request: Request, data: AnalysisReportPDFRequest, user_id: str = Depends(get_current_user_id)):
    """Saves the resume analysis result to the Supabase 'resumes' table."""
    try:
        insert_data = {
            "user_id": user_id,
            "ai_score": data.overall_score,
            "ats_score": data.ats_score,
            "suggestions": json.dumps(data.suggestions),
            "keywords_matched": data.keywords_matched,
            "keywords_missing": data.keywords_missing,
        }
        
        response = supabase.table('resumes').insert(insert_data).execute()

        if len(response.data) == 0:
            raise Exception("Failed to insert data into database.")

        return {"message": f"Analysis for user {user_id} saved successfully!"}
    except Exception as e:
        print(f"Error saving analysis for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-interview/")
@limiter.limit("10 per minute")
async def save_interview(request: Request, data: SaveInterviewRequest, user_id: str = Depends(get_current_user_id)):
    """Saves the mock test/interview result to the Supabase 'interviews' table."""
    try:
        insert_data = {
            "user_id": user_id,
            "job_role": data.job_role,
            "difficulty": data.difficulty,
            "overall_score": data.overall_score,
            "total_questions": data.total_questions,
            "correct_answers": data.correct_answers,
            "answered_questions": data.answered_questions,
            "duration_minutes": data.duration_minutes,
            "questions": json.dumps(data.questions),
            "answers": json.dumps(data.answers),
            "feedback": data.feedback,
            "suggestions": data.suggestions,
            "category_scores": json.dumps(data.category_scores) if data.category_scores else None,
            "status": "completed"
        }
        
        response = supabase.table('interviews').insert(insert_data).execute()

        if len(response.data) == 0:
            raise Exception("Failed to insert interview data into database.")

        return {"message": f"Interview results for user {user_id} saved successfully!"}
    except Exception as e:
        print(f"Error saving interview for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-job/")
@limiter.limit("10 per minute")
async def save_job(request: Request, data: SaveJobRequest, user_id: str = Depends(get_current_user_id)):
    """Saves a job to the Supabase 'saved_jobs' table."""
    try:
        # Check if the job already exists for this user to avoid duplicates
        existing_job = supabase.table('saved_jobs').select("id").eq("user_id", user_id).eq("job_title", data.job_title).eq("company_name", data.company_name).execute()
        if len(existing_job.data) > 0:
            return {"message": "Job already saved."}

        insert_data = {
            "user_id": user_id,
            "job_title": data.job_title,
            "company": data.company_name,
            "location": data.location,
            "external_url": data.job_url,
            "application_status": data.application_status
        }
        
        response = supabase.table('saved_jobs').insert(insert_data).execute()

        if len(response.data) == 0:
            raise Exception("Failed to insert job data into database.")

        return {"message": f"Job saved successfully for user {user_id}!"}
    except Exception as e:
        print(f"Error saving job for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))