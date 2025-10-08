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

const getClerkAuthHeaders = async (getToken: GetTokenFn) => {
  const token = await getToken({ template: "fastapi-template" });
  if (!token) {
    throw new Error("User is not authenticated. Cannot perform this action.");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

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

// =========================================================================
// --- API MODULES ---
// =========================================================================

/**
 * ## Resume Analysis API
 */
export const resumeAPI = {
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
    if (!reader) throw new Error("Failed to read response stream.");

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
  },

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

  async saveAnalysis(getToken: GetTokenFn, analysisData: Partial<Resume>) {
    const { user_id, ...payload } = analysisData;
    const config = await createAuthenticatedRequest(getToken, "POST", payload);
    const response = await fetch(`${API_BASE_URL}/save-analysis/`, config);

    if (!response.ok) throw new Error("Failed to save analysis.");
    return response.json();
  },

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

  async deleteResume(getToken: GetTokenFn, resumeId: string) {
    const config = await createAuthenticatedRequest(getToken, "DELETE");
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, config);
    if (!response.ok) throw new Error("Failed to delete analysis.");
  },
};


/**
 * ## Resume Builder API
 */
export const resumeBuilderAPI = {
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

/**
 * ## Mock Interview & Test API
 */
export const mockAPI = {
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


/**
 * ## Job Management API
 */
export const jobAPI = {
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

  async deleteJob(getToken: GetTokenFn, jobId: string) {
    const config = await createAuthenticatedRequest(getToken, "DELETE");
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, config);
    if (!response.ok) throw new Error("Failed to delete job.");
  },
};