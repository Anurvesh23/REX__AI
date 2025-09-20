// lib/api.ts
// Call FastAPI backend for resume analysis
export async function analyzeResumeBackend(resumeFile: File, jobDescription: string) {
  const formData = new FormData();
  formData.append("jd_text", jobDescription);
  formData.append("file", resumeFile);

  const response = await fetch("http://localhost:8000/analyze/", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to analyze resume");
  }
  return await response.json();
}
import { supabase } from "./supabase"
import type { Resume, Interview, SavedJob } from "./supabase"

// Resume Analysis API
export const resumeAPI = {
  async analyzeResume(resumeFile: File, jobDescription: string) {
    // This now directly calls the backend without any fallback to mock data.
    return analyzeResumeBackend(resumeFile, jobDescription);
  },

  async generateCoverLetter(resumeText: string, jobDescription: string) {
     const response = await fetch("http://localhost:8000/generate-cover-letter/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume: resumeText, job_description: jobDescription }),
    });
    if (!response.ok) {
        throw new Error("Failed to generate cover letter from the backend.");
    }
    const data = await response.json();
    return data.cover_letter;
  },

  async saveAnalysis(userId: string, analysisData: Partial<Resume>) {
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        ...analysisData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserResumes(userId: string) {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async deleteResume(resumeId: string) {
    const { error } = await supabase.from("resumes").delete().eq("id", resumeId)

    if (error) throw error
  },
}

// Mock Interview & Mock Test API
export const interviewAPI = {
  async generateQuestions(jobRole: string, difficulty = 'medium', settings = { num_questions: 10 }) {
    // This single endpoint now serves both the mock interview and mock test features
    const response = await fetch("http://localhost:8000/interview/start/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            role: jobRole,
            difficulty: difficulty,
            num_questions: settings.num_questions,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error:", errorText);
        throw new Error("Failed to generate questions from the backend.");
    }

    const data = await response.json();
    if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Backend did not return questions in the expected format.");
    }

    return data.questions;
  },

  async evaluateAnswer(question: string, answer: string) {
     const response = await fetch("http://localhost:8000/interview/evaluate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, answer }),
    });
    if (!response.ok) {
      throw new Error("Failed to evaluate answer");
    }
    return await response.json();
  },

  async saveInterview(userId: string, interviewData: Partial<Interview>) {
    const { data, error } = await supabase
      .from("interviews")
      .insert({
        user_id: userId,
        ...interviewData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserInterviews(userId: string) {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async updateInterview(interviewId: string, updates: Partial<Interview>) {
    const { data, error } = await supabase.from("interviews").update(updates).eq("id", interviewId).select().single()

    if (error) throw error
    return data
  },
}

// Job Search API
export const jobAPI = {
  async saveJob(userId: string, jobData: Partial<SavedJob>) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .insert({
        user_id: userId,
        ...jobData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSavedJobs(userId: string) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async updateJobStatus(jobId: string, status: SavedJob["application_status"]) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .update({ application_status: status })
      .eq("id", jobId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteJob(jobId: string) {
    const { error } = await supabase.from("saved_jobs").delete().eq("id", jobId)

    if (error) throw error
  },
}

// --- Live AI Interview API Functions (re-exporting for consistency) ---

export const { generateQuestions: startInterview } = interviewAPI;