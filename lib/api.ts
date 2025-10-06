// lib/api.ts

import type {
  Resume,
  MockInterview,
  MockTest,
  SavedJob,
  ResumeAnalysis,
} from "./types";

// --- Configuration ---
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// --- Type Definition for Clerk's getToken function ---
type GetTokenFn = (options?: {
  template?: string;
}) => Promise<string | null>;

// --- Authentication & Request Helpers ---

/**
 * Retrieves Clerk authentication headers, including the JWT from a specific template.
 * This function is designed to be used by createAuthenticatedRequest.
 * Throws an error if the user is not authenticated.
 * @param getToken - The `getToken` function from Clerk's `useAuth` hook.
 */
const getClerkAuthHeaders = async (getToken: GetTokenFn) => {
  // IMPORTANT: Replace 'fastapi-template' with the name of the JWT Template you created in your Clerk Dashboard.
  const token = await getToken({ template: "fastapi-template" });
  if (!token) {
    throw new Error("User is not authenticated. Cannot perform this action.");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Creates a fetch configuration with authentication headers.
 * This function must be called from a Client Component context where Clerk's useAuth hook is available.
 * @param getToken - The `getToken` function from Clerk's `useAuth` hook.
 * @param method - HTTP method (e.g., 'POST').
 * @param body - The request body (can be FormData or a JSON object).
 */
const createAuthenticatedRequest = async (
  getToken: GetTokenFn,
  method: "POST" | "GET" | "DELETE" | "PUT",
  body?: any
): Promise<RequestInit> => {
  const headers = await getClerkAuthHeaders(getToken);
  const config: RequestInit = {
    method,
    headers: {
      ...headers,
      // Don't set Content-Type for FormData; the browser adds it with the correct boundary.
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
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
  async analyzeResume(
    getToken: GetTokenFn,
    resumeFile: File,
    jobDescription: string
  ) {
    const formData = new FormData();
    formData.append("jd_text", jobDescription);
    formData.append("file", resumeFile);

    const config = await createAuthenticatedRequest(getToken, "POST", formData);
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
  async generateCoverLetter(
    getToken: GetTokenFn,
    resumeText: string,
    jobDescription: string,
    onChunk: (chunk: string) => void
  ) {
    const payload = { resume: resumeText, job_description: jobDescription };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(
      `${API_BASE_URL}/generate-cover-letter/`,
      config
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate cover letter: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to read response stream.");
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      onChunk(decoder.decode(value, { stream: true }));
    }
  },

  /**
   * Sends original resume and JD to the backend for a full AI rewrite. (Secured)
   */
  async generateOptimizedResume(
    getToken: GetTokenFn,
    resumeText: string,
    jobDescription: string
  ): Promise<{ optimized_resume_text: string }> {
    const payload = {
      resume_text: resumeText,
      job_description: jobDescription,
    };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(
      `${API_BASE_URL}/generate-optimized-resume/`,
      config
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate optimized resume: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Saves the result of a resume analysis via the backend. (Secured)
   */
  async saveAnalysis(getToken: GetTokenFn, analysisData: Partial<Resume>) {
    const { user_id, ...payload } = analysisData;
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(`${API_BASE_URL}/save-analysis/`, config);

    if (!response.ok) throw new Error("Failed to save analysis.");
    return response.json();
  },

  /**
   * Generates a PDF report for a resume analysis from the backend. (Secured)
   */
  async generateAnalysisReport(
    getToken: GetTokenFn,
    reportData: any
  ): Promise<Blob> {
    const config = await createAuthenticatedRequest(
      getToken,
      "POST",
      reportData
    );
    const response = await fetch(
      `${API_BASE_URL}/generate-analysis-pdf/`,
      config
    );

    if (!response.ok) {
      throw new Error("Failed to generate PDF report from the backend.");
    }
    return response.blob();
  },

  /**
   * Generates a PDF of the AI-optimized resume from the backend. (Secured)
   */
  async generateAiResumePdf(
    getToken: GetTokenFn,
    optimizedResumeText: string
  ): Promise<Blob> {
    const payload = { optimized_resume_text: optimizedResumeText };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(
      `${API_BASE_URL}/generate-ai-resume-pdf/`,
      config
    );

    if (!response.ok) {
      throw new Error("Failed to generate AI resume PDF from the backend.");
    }
    return response.blob();
  },

  /**
   * Retrieves all past resume analyses for a user by calling the backend API.
   */
  async getUserResumes(
    getToken: GetTokenFn,
    userId: string
  ): Promise<ResumeAnalysis[]> {
    const config = await createAuthenticatedRequest(getToken, "GET");
    const response = await fetch(
      `${API_BASE_URL}/resumes/?user_id=${userId}`,
      config
    );
    if (!response.ok) throw new Error("Failed to fetch resume history.");
    return response.json();
  },

  /**
   * Deletes a specific resume analysis via the backend API.
   */
  async deleteResume(getToken: GetTokenFn, resumeId: string) {
    const config = await createAuthenticatedRequest(getToken, "DELETE");
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, config);
    if (!response.ok) throw new Error("Failed to delete analysis.");
  },
};

// --- Resume Builder API ---

export const resumeBuilderAPI = {
  /**
   * Sends an experience description to the backend for an AI rewrite. (Secured)
   */
  async rewriteDescription(
    getToken: GetTokenFn,
    title: string,
    description: string
  ): Promise<{ rewritten_description: string }> {
    const payload = { title, description };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(
      `${API_BASE_URL}/resume-builder/rewrite-description/`,
      config
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to rewrite description: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Sends the entire resume data object for AI improvement. (Secured)
   */
  async improveResume(getToken: GetTokenFn, resumeData: any): Promise<any> {
    const config = await createAuthenticatedRequest(
      getToken,
      "POST",
      resumeData
    );
    const response = await fetch(
      `${API_BASE_URL}/resume-builder/improve-resume/`,
      config
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI improvement failed: ${errorText}`);
    }
    return response.json();
  },
};

// --- Mock Interview & Mock Test API ---

export const mockAPI = {
  /**
   * Generates mock test questions from the backend. (Secured)
   */
  async generateQuestions(
    getToken: GetTokenFn,
    jobRole: string,
    difficulty = "medium",
    settings = { num_questions: 10 }
  ) {
    const payload = {
      role: jobRole,
      difficulty: difficulty,
      num_questions: settings.num_questions,
    };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
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
  async evaluateTest(getToken: GetTokenFn, questions: any[], answers: any[]) {
    const payload = { questions, answers };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(
      `${API_BASE_URL}/interview/evaluate-test/`,
      config
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to evaluate test: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Submits answers from a video interview for evaluation. (Secured)
   */
  async evaluateAnswers(
    getToken: GetTokenFn,
    payload: { questions: any[]; answers: any[] }
  ) {
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(
      `${API_BASE_URL}/interview/evaluate-answers/`,
      config
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to evaluate answers: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Generates a PDF report for a mock test from the backend. (Secured)
   */
  async generateTestReport(
    getToken: GetTokenFn,
    reportData: any
  ): Promise<Blob> {
    const config = await createAuthenticatedRequest(
      getToken,
      "POST",
      reportData
    );
    const response = await fetch(
      `${API_BASE_URL}/interview/generate-report-pdf/`,
      config
    );

    if (!response.ok) {
      throw new Error("Failed to generate PDF report from the backend.");
    }
    return response.blob();
  },

  /**
   * Saves mock test results via the backend. (Secured)
   */
  async saveTest(getToken: GetTokenFn, testData: Partial<MockTest>) {
    const { user_id, ...payload } = testData;
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(`${API_BASE_URL}/save-test/`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save test results: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Saves interview results via the backend. (Secured)
   */
  async saveInterview(
    getToken: GetTokenFn,
    interviewData: Partial<MockInterview>
  ) {
    const { user_id, ...payload } = interviewData;
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(`${API_BASE_URL}/save-interview/`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save interview results: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Retrieves all past mock tests for a user from the backend API.
   */
  async getUserMockTests(
    getToken: GetTokenFn,
    userId: string
  ): Promise<MockTest[]> {
    const config = await createAuthenticatedRequest(getToken, "GET");
    const response = await fetch(
      `${API_BASE_URL}/mock-tests/?user_id=${userId}`,
      config
    );
    if (!response.ok) throw new Error("Failed to fetch mock test history.");
    return response.json();
  },

  /**
   * Retrieves all past interviews for a user from the backend API.
   */
  async getUserInterviews(
    getToken: GetTokenFn,
    userId: string
  ): Promise<MockInterview[]> {
    const config = await createAuthenticatedRequest(getToken, "GET");
    const response = await fetch(
      `${API_BASE_URL}/interviews/?user_id=${userId}`,
      config
    );
    if (!response.ok) throw new Error("Failed to fetch interview history.");
    return response.json();
  },

  /**
   * Generates audio from text using the backend. (Secured)
   */
  async speak(getToken: GetTokenFn, text: string) {
    const payload = { text };
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(`${API_BASE_URL}/interview/speak/`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate speech: ${errorText}`);
    }
    return response.json();
  },
};

// --- Job Management API ---

export const jobAPI = {
  /**
   * Saves a job listing via the backend. (Secured)
   */
  async saveJob(
    getToken: GetTokenFn,
    jobData: Partial<SavedJob>
  ): Promise<{ message: string }> {
    const { user_id, ...payload } = jobData;
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(`${API_BASE_URL}/save-job/`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save job: ${errorText}`);
    }
    return response.json();
  },

  /**
   * Retrieves all saved jobs for a user from the backend API.
   */
  async getSavedJobs(
    getToken: GetTokenFn,
    userId: string
  ): Promise<SavedJob[]> {
    const config = await createAuthenticatedRequest(getToken, "GET");
    const response = await fetch(
      `${API_BASE_URL}/jobs/?user_id=${userId}`,
      config
    );
    if (!response.ok) throw new Error("Failed to fetch saved jobs.");
    return response.json();
  },

  /**
   * Updates the status of a saved job via the backend API.
   */
  async updateJobStatus(
    getToken: GetTokenFn,
    jobId: string,
    status: SavedJob["application_status"]
  ): Promise<SavedJob> {
    const config = await createAuthenticatedRequest(getToken, "PUT", {
      application_status: status,
    });
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, config);
    if (!response.ok) throw new Error("Failed to update job status.");
    return response.json();
  },

  /**
   * Deletes a saved job via the backend API.
   */
  async deleteJob(getToken: GetTokenFn, jobId: string) {
    const config = await createAuthenticatedRequest(getToken, "DELETE");
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, config);
    if (!response.ok) throw new Error("Failed to delete job.");
  },
};