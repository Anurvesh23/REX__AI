# --- Core Imports ---
import tempfile
import sys
import os
import json
import uuid
from typing import List, Optional, Dict, Any, AsyncGenerator
import asyncpg

# --- Environment and AI ---
import google.generativeai as genai
from dotenv import load_dotenv

# --- Web Framework (FastAPI) ---
from fastapi import (
    FastAPI, UploadFile, File, Form, Body, Depends, HTTPException, Header, status, Request
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

# --- Security ---
from clerk_backend_api import Clerk, ClerkError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- Data Models ---
from pydantic import BaseModel

# --- Utilities ---
from fpdf import FPDF
from gtts import gTTS

# Add parent directory to system path for local module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils import save_upload_to_temp, extract_text_from_path

# --- Environment & AI Configuration ---
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(dotenv_path=dotenv_path)
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    clerk_secret_key = os.getenv("CLERK_SECRET_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    if not clerk_secret_key:
        raise ValueError("CLERK_SECRET_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
    print("--- Gemini AI configured successfully. ---")
except Exception as e:
    print(f"FATAL: Error configuring services. Please check your environment variables. Error: {e}")


# --- AWS RDS Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment for RDS connection.")

# This global variable will hold the connection pool.
db_pool = None

# --- App & Middleware Setup ---
app = FastAPI(title="Rex--AI API")

@app.on_event("startup")
async def startup():
    """Initializes the database connection pool on application startup."""
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(dsn=DATABASE_URL)
        print("--- Database connection pool created successfully. ---")
    except Exception as e:
        print(f"FATAL: Could not connect to the database. Error: {e}")
        db_pool = None


@app.on_event("shutdown")
async def shutdown():
    """Closes the database connection pool on application shutdown."""
    if db_pool:
        await db_pool.close()
        print("--- Database connection pool closed. ---")

async def get_db_connection():
    """Dependency to get a database connection from the pool."""
    if db_pool is None:
        raise HTTPException(status_code=500, detail="Database connection pool is not initialized.")
    async with db_pool.acquire() as connection:
        yield connection

# Security: Rate Limiting
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security: CORS Configuration
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- Static Files for Audio ---
if not os.path.exists("temp_audio"):
    os.makedirs("temp_audio")
app.mount("/temp_audio", StaticFiles(directory="temp_audio"), name="temp_audio")

# --- Security: Authentication ---
clerk_client = Clerk(bearer_auth=clerk_secret_key)

async def get_current_user_id(authorization: str = Header(None)):
    """Dependency to extract and validate user ID from a Clerk JWT."""
    if authorization is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header is missing")
    
    try:
        token = authorization.split(" ")[1]
        # The verify_token method is on the client now, not sessions
        session_claims = clerk_client.sessions.verify_token(token)
        user_id = session_claims.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: user ID is missing")
        return user_id
    except Exception as e:
        # Catch a general exception and then raise the appropriate HTTP exception
        if "Clerk" in str(e): # A simple way to check if it's a Clerk-related error
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Clerk authentication failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token format or other error: {e}")
    
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
class SaveAnalysisRequest(BaseModel):
    overall_score: int
    job_match: int
    ats_score: int
    suggestions: List[Dict[str, Any]]
    keywords_matched: List[str]
    keywords_missing: List[str]
    strengths: List[str]
    weaknesses: List[str]
    job_description: str
    original_resume_text: str
    job_title: Optional[str] = "Resume Analysis"

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
    duration_minutes: int
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    feedback: Optional[str] = None
    suggestions: Optional[List[str]] = None
    category_scores: Optional[Dict[str, int]] = None

class SaveTestRequest(BaseModel):
    job_role: str
    difficulty: str
    overall_score: int
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

class EvaluateAnswersRequest(BaseModel):
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]

class AnalysisReport(BaseModel):
    overall_score: int
    category_scores: Dict[str, int]
    feedback: str
    suggestions: List[str]

class RewriteRequest(BaseModel):
    title: str
    description: str

class PersonalInfoModel(BaseModel):
    name: str; email: str; phone: str; location: str; website: str; linkedin: str; github: str

class ExperienceModel(BaseModel):
    id: str; title: str; company: str; location: str; startDate: str; endDate: str; description: str

class EducationModel(BaseModel):
    id: str; school: str; location: str; degree: str; field: str; graduationDate: str

class SkillModel(BaseModel):
    id: str; name: str

class ProjectModel(BaseModel):
    id: str; name: str; description: str; url: str

class CertificationModel(BaseModel):
    id: str; name: str; issuer: str; date: str

class ResumeDataModel(BaseModel):
    personalInfo: PersonalInfoModel
    summary: str
    experience: List[ExperienceModel]
    education: List[EducationModel]
    skills: List[SkillModel]
    projects: List[ProjectModel]
    certifications: List[CertificationModel]

class ResumeSaveData(BaseModel):
    personalInfo: dict
    experience: list
    education: list
    skills: list

# --- PDF Generation Helpers ---
def create_analysis_pdf(data):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="AI Resume Analysis Report", ln=True, align='C')
    pdf.cell(200, 10, txt=f"Overall Score: {data.get('overall_score', 'N/A')}", ln=True)
    pdf.cell(200, 10, txt=f"ATS Score: {data.get('ats_score', 'N/A')}", ln=True)
    pdf.cell(200, 10, txt=f"Job Match: {data.get('job_match', 'N/A')}", ln=True)
    pdf_output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
    pdf.output(pdf_output_path)
    return pdf_output_path

def create_optimized_resume_pdf(optimized_text):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=10)
    pdf.multi_cell(0, 5, txt=optimized_text)
    pdf_output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
    pdf.output(pdf_output_path)
    return pdf_output_path

def create_test_report_pdf(data):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"{data.job_role} Mock Test Report", ln=True, align='C')
    pdf.cell(200, 10, txt=f"Overall Score: {data.overall_score}/{data.total_questions}", ln=True)
    pdf.cell(200, 10, txt=f"Difficulty: {data.difficulty.capitalize()}", ln=True)
    pdf_output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
    pdf.output(pdf_output_path)
    return pdf_output_path
    
# --- API Endpoints ---
@app.get("/")
async def root():
    return {"message": "Welcome to the Rex--AI API!"}

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
        model = genai.GenerativeModel('gemini-pro')
        
        # --- Job Description Validation ---
        validation_prompt = f"""
        Is the following text a valid job description? Answer with only "yes" or "no".
        Text: "{jd_text}"
        """
        validation_response = model.generate_content(validation_prompt)
        if "yes" not in validation_response.text.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid job description provided. Please paste the full job description."
            )

        # --- Resume Processing ---
        temp_path = save_upload_to_temp(file)
        resume_text = extract_text_from_path(temp_path)
        
        # --- AI Analysis ---
        analysis_prompt = f"""
        Analyze the provided resume against the job description and return ONLY a valid JSON object.
        Job Description: {jd_text}
        Resume: {resume_text}
        
        JSON Structure:
        {{
            "overall_score": "<number>",
            "skills_match": "<number|null>",
            "experience_match": "<number|null>",
            "education_match": "<number|null>",
            "job_match": "<number>",
            "ats_score": "<number>",
            "suggestions": [{{ "type": "string", "title": "string", "description": "string", "impact": "string", "category": "string" }}],
            "keywords_matched": ["string"],
            "keywords_missing": ["string"],
            "strengths": ["string"],
            "weaknesses": ["string"]
        }}
        """
        response = model.generate_content(analysis_prompt)
        
        # --- Response Handling ---
        try:
            # Clean the response to ensure it's valid JSON
            json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
            analysis_result = json.loads(json_response_text)
            return analysis_result
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"--- ERROR: AI returned an invalid format for user {user_id}. ---")
            print(f"Raw AI Response: {response.text}")
            raise HTTPException(
                status_code=500, 
                detail="The AI's response was not in the expected format. Please try again."
            )

    except HTTPException as http_exc:
        # Re-raise exceptions we've already handled
        raise http_exc
    except Exception as e:
        print(f"--- UNEXPECTED ERROR in analyze_resume for user {user_id}: {e} ---")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during analysis.")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/generate-optimized-resume/")
@limiter.limit("5 per minute")
async def generate_optimized_resume(request: Request, data: OptimizeResumeRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-pro')
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

async def cover_letter_streamer(resume: str, job_description: str) -> AsyncGenerator[str, None]:
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"Generate a professional and compelling cover letter based on the following resume and job description. The cover letter should be 3-4 paragraphs, highlight relevant skills and experience, and show enthusiasm for the role.\n\nRESUME:\n{resume}\n\nJOB DESCRIPTION:\n{job_description}"
        response_stream = model.generate_content(prompt, stream=True)
        for chunk in response_stream:
            yield chunk.text
    except Exception as e:
        print(f"Error during cover letter streaming: {e}")
        yield f"Error: {e}"

@app.post("/generate-cover-letter/")
@limiter.limit("5 per minute")
async def generate_cover_letter(request: Request, data: CoverLetterRequest, user_id: str = Depends(get_current_user_id)):
    try:
        return StreamingResponse(
            cover_letter_streamer(data.resume, data.job_description),
            media_type="text/event-stream"
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@app.post("/interview/start/")
@limiter.limit("5 per minute")
async def start_skill_test(request: Request, data: StartTestRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Generate exactly {data.num_questions} multiple-choice questions for a '{data.role}' position at a '{data.difficulty}' level. Return ONLY a valid JSON array of objects.

        JSON Structure per question:
        {{
            "id": "<number>",
            "question": "string",
            "category": "string",
            "difficulty": "{data.difficulty}",
            "options": ["string", "string", "string", "string"],
            "correctAnswer": "string"
        }}
        """
        response = model.generate_content(prompt)
        
        try:
            # Clean the response to ensure it's valid JSON
            json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
            questions = json.loads(json_response_text)
            
            if not isinstance(questions, list) or len(questions) == 0:
                raise ValueError("AI did not return a valid list of questions.")
            
            # Ensure IDs are correctly assigned
            for i, q in enumerate(questions):
                q['id'] = i + 1
            
            return {"questions": questions}
        except (json.JSONDecodeError, ValueError) as e:
            print(f"--- ERROR: AI returned an invalid format for user {user_id}. ---")
            print(f"Raw AI Response: {response.text}")
            raise HTTPException(
                status_code=500, 
                detail=f"The AI returned an invalid question format: {e}"
            )
            
    except Exception as e:
        print(f"--- UNEXPECTED ERROR in start_skill_test for user {user_id}: {e} ---")
        return JSONResponse(status_code=500, content={"message": f"An unexpected error occurred: {str(e)}"})

@app.post("/interview/evaluate-test/")
@limiter.limit("10 per minute")
async def evaluate_test(request: Request, data: EvaluateTestRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-pro')
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

@app.post("/interview/evaluate-answers/")
@limiter.limit("10 per minute")
async def evaluate_answers(
    request: Request,
    data: EvaluateAnswersRequest,
    user_id: str = Depends(get_current_user_id)
):
    try:
        correct_answers = 0
        for answer in data.answers:
            if answer.get("is_correct"):
                correct_answers += 1
        
        overall_score = (correct_answers / len(data.questions)) * 100 if data.questions else 0

        category_scores = {
            "clarity": 80,
            "confidence": 75,
            "technical_knowledge": 85,
            "communication": 90,
        }
        feedback = "Overall, you performed well. You demonstrated strong technical knowledge and clear communication. To improve, try to be more concise in your answers."
        suggestions = [
            "Practice the STAR method for behavioral questions.",
            "Review common data structures and algorithms.",
            "Record yourself answering questions to improve your delivery.",
        ]

        report = AnalysisReport(
            overall_score=int(overall_score),
            category_scores=category_scores,
            feedback=feedback,
            suggestions=suggestions,
        )

        return report
    except Exception as e:
        print(f"Error during answer evaluation for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/interview/speak/")
@limiter.limit("20 per minute")
async def speak_text(request: Request, data: SpeakRequest, user_id: str = Depends(get_current_user_id)):
    try:
        tts = gTTS(text=data.text, lang='en', tld='co.in', slow=False)
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("temp_audio", filename)
        tts.save(filepath)
        audio_url = f"/temp_audio/{filename}"
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
async def save_analysis(
    request: Request,
    data: SaveAnalysisRequest,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    try:
        sanitized_job_description = data.job_description.replace('\u0000', '')
        sanitized_resume_text = data.original_resume_text.replace('\u0000', '')
        
        combined_suggestions = list(data.suggestions)
        for strength in data.strengths:
            combined_suggestions.append({"type": "success", "title": "Strength", "description": strength, "impact": "Positive", "category": "General"})
        for weakness in data.weaknesses:
            combined_suggestions.append({"type": "improvement", "title": "Weakness", "description": weakness, "impact": "Medium", "category": "General"})

        await conn.execute(
            """
            INSERT INTO rex_ai (
                user_id, job_title, job_description, original_resume_text, ai_score, 
                keyword_match_score, ats_score, suggestions, keywords_matched, keywords_missing
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
            user_id,
            data.job_title or "Resume Analysis",
            sanitized_job_description,
            sanitized_resume_text,
            data.overall_score,
            data.job_match,
            data.ats_score,
            json.dumps(combined_suggestions),
            json.dumps(data.keywords_matched),
            json.dumps(data.keywords_missing)
        )
        
        return {"message": f"Analysis for user {user_id} saved successfully!"}
    except Exception as e:
        print(f"Error saving analysis for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-test/")
@limiter.limit("10 per minute")
async def save_test(
    request: Request,
    data: SaveTestRequest,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    try:
        new_record = await conn.fetchrow(
            """
            INSERT INTO mock_tests (
                user_id, job_role, difficulty, overall_score, duration_minutes,
                questions, answers, feedback, suggestions, category_scores, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
            """,
            user_id,
            data.job_role,
            data.difficulty,
            data.overall_score,
            data.duration_minutes,
            json.dumps(data.questions),
            json.dumps(data.answers),
            data.feedback,
            json.dumps(data.suggestions),
            json.dumps(data.category_scores),
            "completed"
        )
        return {"message": f"Test results for user {user_id} saved successfully!", "data": dict(new_record)}
    except Exception as e:
        print(f"Error saving test for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-interview/")
@limiter.limit("10 per minute")
async def save_interview(
    request: Request,
    data: SaveInterviewRequest,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    try:
        settings_data = {
            "num_questions": len(data.questions),
            "difficulty": data.difficulty,
            "focus_areas": ["general", "technical"] 
        }

        new_record = await conn.fetchrow(
            """
            INSERT INTO mock_interviews (
                user_id, job_role, interview_type, settings, overall_score,
                duration_minutes, questions, answers, feedback, suggestions,
                category_scores, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
            """,
            user_id,
            data.job_role,
            "mixed",
            json.dumps(settings_data),
            data.overall_score,
            data.duration_minutes,
            json.dumps(data.questions),
            json.dumps(data.answers),
            data.feedback,
            json.dumps(data.suggestions),
            json.dumps(data.category_scores),
            "completed"
        )
        return {"message": f"Interview results for user {user_id} saved successfully!", "data": dict(new_record)}
    except Exception as e:
        print(f"Error saving interview for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-job/")
@limiter.limit("10 per minute")
async def save_job(
    request: Request,
    data: SaveJobRequest,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    try:
        existing_job = await conn.fetchrow(
            "SELECT id FROM saved_jobs WHERE user_id = $1 AND job_title = $2 AND company = $3",
            user_id, data.job_title, data.company_name
        )
        if existing_job:
            return {"message": "Job already saved."}

        await conn.execute(
            """
            INSERT INTO saved_jobs (user_id, job_title, company, location, external_url, application_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            user_id, data.job_title, data.company_name, data.location, data.job_url, data.application_status
        )
        return {"message": f"Job saved successfully for user {user_id}!"}
    except Exception as e:
        print(f"Error saving job for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume-builder/rewrite-description/")
@limiter.limit("10 per minute")
async def rewrite_description(request: Request, data: RewriteRequest, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        As an expert resume writer, rewrite the following job description for a '{data.title}' position to be more impactful and action-oriented. 
        Focus on achievements and quantifiable results. Use strong action verbs and concise language.
        Return only the rewritten description as a plain text response, with each point on a new line.

        Original Description:
        {data.description}

        Rewritten Description:
        """
        response = model.generate_content(prompt)
        return {"rewritten_description": response.text}
    except Exception as e:
        print(f"Error during description rewrite for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to rewrite description: {str(e)}")

@app.post("/resume-builder/save")
async def save_resume_data(data: ResumeSaveData, user_id: str = Depends(get_current_user_id)):
    print(f"Saving resume for user {user_id}:", data.dict())
    return {"message": "Resume saved successfully"}

@app.get("/resume-builder/load")
async def load_resume_data(user_id: str = Depends(get_current_user_id)):
    mock_data = {
        "personalInfo": {"name": "John Doe", "email": "john.doe@example.com"},
        "experience": [],
        "education": [],
        "skills": []
    }
    return mock_data

@app.post("/resume-builder/improve-resume/")
@limiter.limit("5 per minute")
async def improve_resume_with_ai(request: Request, data: ResumeDataModel, user_id: str = Depends(get_current_user_id)):
    try:
        model = genai.GenerativeModel('gemini-pro')
        resume_json_str = data.json()

        prompt = f"""
        **Task:** You are an expert career coach and professional resume writer. Your task is to analyze the provided resume JSON data and improve its content for clarity, impact, and professionalism.

        **Instructions:**
        1.  **Rewrite for Impact:** For the `summary` and each `description` in the `experience` and `projects` sections, rewrite the text to be more action-oriented and results-driven. Use the STAR (Situation, Task, Action, Result) method where applicable. Incorporate quantifiable metrics if possible (you can infer reasonable metrics if none are provided, e.g., "improved performance by 15%").
        2.  **Maintain Structure:** You MUST return the data in the exact same JSON format as the input. Do not add, remove, or rename any keys. The `id` for each item must remain unchanged.
        3.  **No New Information:** Only enhance the existing text. Do not invent new jobs, skills, or projects.
        4.  **Output:** Your entire response must be ONLY the modified JSON object, with no extra text, explanations, or markdown formatting like ```json.

        ---
        **ORIGINAL RESUME DATA (JSON):**
        {resume_json_str}
        ---

        **IMPROVED RESUME DATA (JSON):**
        """
        
        response = model.generate_content(prompt)
        
        json_response_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        improved_data = json.loads(json_response_text)
        
        validated_data = ResumeDataModel(**improved_data)
        
        return validated_data
    except Exception as e:
        print(f"Error during AI resume improvement for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to improve resume with AI: {str(e)}")