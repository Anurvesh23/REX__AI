import { supabase } from "./supabase";
import type { Resume, Interview, SavedJob } from "./types";

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// --- Authentication & Request Helpers ---

/**
 * Retrieves Supabase authentication headers, including the JWT.
 * Throws an error if the user is not authenticated.
 */
const getSupabaseAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated. Cannot perform this action.");
    }
    return {
        'Authorization': `Bearer ${session.access_token}`,
    };
};

/**
 * Creates a fetch configuration with authentication headers.
 * @param method - HTTP method (e.g., 'POST').
 * @param body - The request body (can be FormData or a JSON object).
 */
const createAuthenticatedRequest = async (method: 'POST' | 'GET', body?: any): Promise<RequestInit> => {
    const headers = await getSupabaseAuthHeaders();
    const config: RequestInit = {
        method,
        headers: {
            ...headers,
            // Don't set Content-Type for FormData; the browser adds it with the correct boundary.
            ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        },
    };
    if (body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body);
    }
    return config;
};

// --- Resume Analysis API ---

export const resumeAPI = {
    /**
     * Sends resume and job description to the backend for AI analysis. (Secured)
     */
    async analyzeResume(resumeFile: File, jobDescription: string) {
        const formData = new FormData();
        formData.append("jd_text", jobDescription);
        formData.append("file", resumeFile);

        const config = await createAuthenticatedRequest('POST', formData);
        const response = await fetch(`${API_BASE_URL}/analyze/`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to analyze resume: ${errorText}`);
        }
        return response.json();
    },

    /**
     * Generates a cover letter using the backend AI. (Secured)
     */
    async generateCoverLetter(resumeText: string, jobDescription: string) {
        const payload = { resume: resumeText, job_description: jobDescription };
        const config = await createAuthenticatedRequest('POST', payload);
        const response = await fetch(`${API_BASE_URL}/generate-cover-letter/`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate cover letter: ${errorText}`);
        }
        const data = await response.json();
        return data.cover_letter;
    },
    
    /**
     * Sends original resume and JD to the backend for a full AI rewrite. (Secured)
     */
    async generateOptimizedResume(resumeText: string, jobDescription: string): Promise<{ optimized_resume_text: string }> {
        const payload = { resume_text: resumeText, job_description: jobDescription };
        const config = await createAuthenticatedRequest('POST', payload);
        const response = await fetch(`${API_BASE_URL}/generate-optimized-resume/`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate optimized resume: ${errorText}`);
        }
        return response.json();
    },

    /**
     * Saves the result of a resume analysis via the backend. (Secured)
     * The user_id is handled by the backend via the JWT.
     */
    async saveAnalysis(analysisData: Partial<Resume>) {
        const { user_id, ...payload } = analysisData; // Exclude user_id from frontend payload
        const config = await createAuthenticatedRequest('POST', payload);
        const response = await fetch(`${API_BASE_URL}/save-analysis/`, config);

        if (!response.ok) throw new Error("Failed to save analysis.");
        return response.json();
    },

    /**
     * Generates a PDF report for a resume analysis from the backend. (Secured)
     */
    async generateAnalysisReport(reportData: any): Promise<Blob> {
        const config = await createAuthenticatedRequest('POST', reportData);
        const response = await fetch(`${API_BASE_URL}/generate-analysis-pdf/`, config);

        if (!response.ok) {
            throw new Error("Failed to generate PDF report from the backend.");
        }
        return response.blob();
    },

    /**
     * Generates a PDF of the AI-optimized resume from the backend. (Secured)
     */
    async generateAiResumePdf(optimizedResumeText: string): Promise<Blob> {
        const payload = { optimized_resume_text: optimizedResumeText };
        const config = await createAuthenticatedRequest('POST', payload);
        const response = await fetch(`${API_BASE_URL}/generate-ai-resume-pdf/`, config);

        if (!response.ok) {
            throw new Error("Failed to generate AI resume PDF from the backend.");
        }
        return response.blob();
    },

    /**
     * Retrieves all past resume analyses for a user directly from Supabase.
     */
    async getUserResumes(userId: string): Promise<Resume[]> {
        const { data, error } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Deletes a specific resume analysis directly from Supabase.
     */
    async deleteResume(resumeId: string) {
        const { error } = await supabase.from("resumes").delete().eq("id", resumeId);
        if (error) throw error;
    },
};

// --- Mock Interview & Mock Test API ---

export const interviewAPI = {
    /**
     * Generates mock test questions from the backend. (Secured)
     */
    async generateQuestions(jobRole: string, difficulty = 'medium', settings = { num_questions: 10 }) {
        const payload = {
            role: jobRole,
            difficulty: difficulty,
            num_questions: settings.num_questions,
        };
        const config = await createAuthenticatedRequest('POST', payload);
        const response = await fetch(`${API_BASE_URL}/interview/start/`, config);

        if (!response.ok) throw new Error("Failed to generate questions.");
        
        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error("Backend did not return questions in the expected format.");
        }
        return data.questions;
    },

    /**
     * Submits a completed mock test to the backend for evaluation. (Secured)
     */
    async evaluateTest(questions: any[], answers: any[]) {
        const payload = { questions, answers };
        const config = await createAuthenticatedRequest('POST', payload);
        const response = await fetch(`${API_BASE_URL}/interview/evaluate-test/`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to evaluate test: ${errorText}`);
        }
        return response.json();
    },

    /**
     * Generates a PDF report for a mock test from the backend. (Secured)
     */
    async generateTestReport(reportData: any): Promise<Blob> {
        const config = await createAuthenticatedRequest('POST', reportData);
        const response = await fetch(`${API_BASE_URL}/interview/generate-report-pdf/`, config);

        if (!response.ok) {
            throw new Error("Failed to generate PDF report from the backend.");
        }
        return response.blob();
    },

    /**
     * Saves interview results directly to Supabase.
     */
    async saveInterview(userId: string, interviewData: Partial<Interview>): Promise<Interview> {
        const { data, error } = await supabase
            .from("interviews")
            .insert({ user_id: userId, ...interviewData })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Retrieves all past interviews for a user directly from Supabase.
     */
    async getUserInterviews(userId: string): Promise<Interview[]> {
        const { data, error } = await supabase
            .from("interviews")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },
};

// --- Job Management API ---

export const jobAPI = {
    /**
     * Saves a job listing directly to Supabase.
     */
    async saveJob(userId: string, jobData: Partial<SavedJob>): Promise<SavedJob> {
        const { data, error } = await supabase
            .from("saved_jobs")
            .insert({ user_id: userId, ...jobData })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Retrieves all saved jobs for a user directly from Supabase.
     */
    async getSavedJobs(userId: string): Promise<SavedJob[]> {
        const { data, error } = await supabase
            .from("saved_jobs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Updates the status of a saved job directly in Supabase.
     */
    async updateJobStatus(jobId: string, status: SavedJob["application_status"]): Promise<SavedJob> {
        const { data, error } = await supabase
            .from("saved_jobs")
            .update({ application_status: status })
            .eq("id", jobId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Deletes a saved job directly from Supabase.
     */
    async deleteJob(jobId: string) {
        const { error } = await supabase.from("saved_jobs").delete().eq("id", jobId);
        if (error) throw error;
    },
};