// lib/api.ts
// Call FastAPI backend for resume analysis
export async function analyzeResumeBackend(resumeFile: File, jobDescription: string, weights = { skills: 0.35, semantic: 0.45, experience: 0.2 }, required_years = 2) {
  const formData = new FormData();
  formData.append("jd_text", jobDescription);
  formData.append("required_years", required_years.toString());
  formData.append("w_skills", weights.skills.toString());
  formData.append("w_sem", weights.semantic.toString());
  formData.append("w_exp", weights.experience.toString());
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
  async analyzeResume(resumeText: string, jobDescription?: string) {
    // Simulate AI analysis - in production, this would call Gemini API
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockAnalysis = {
      ai_score: Math.floor(Math.random() * 20) + 80, // 80-100
      ats_score: Math.floor(Math.random() * 15) + 85, // 85-100
      keyword_match_score: Math.floor(Math.random() * 25) + 75, // 75-100
      suggestions: [
        {
          type: "improvement",
          title: "Add Technical Skills Section",
          description: "Include a dedicated technical skills section with relevant technologies.",
          impact: "High",
          category: "content",
        },
        {
          type: "warning",
          title: "Quantify Achievements",
          description: "Add specific numbers and metrics to your accomplishments.",
          impact: "Medium",
          category: "content",
        },
        {
          type: "success",
          title: "Strong Action Verbs",
          description: "Good use of action verbs throughout the resume.",
          impact: "Positive",
          category: "language",
        },
      ],
      keywords_matched: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
      keywords_missing: ["TypeScript", "Docker", "AWS", "GraphQL", "Testing"],
      parsed_resume_json: {
        sections: {
          contact: { name: "[Your Name]", email: "example@email.com" },
          experience: [],
          education: [],
          skills: [],
        },
      },
    }

    return mockAnalysis
  },

  async generateCoverLetter(resumeText: string, jobDescription: string) {
    // Simulate AI cover letter generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return `Dear Hiring Manager,

I am writing to express my strong interest in the position at your company. Based on my experience and the job requirements, I believe I would be a valuable addition to your team.

My background in software development, particularly with React and Node.js, aligns well with your technical requirements. I have successfully delivered multiple projects that demonstrate my ability to work with modern web technologies and contribute to team success.

I am excited about the opportunity to bring my skills and passion to your organization. Thank you for considering my application.

Best regards,
[Your Name]`
  },

  // lib/api.ts

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

// Mock Interview API
export const interviewAPI = {
  async generateQuestions(jobRole: string, difficulty = 'medium', settings = { num_questions: 10 }) {
    // This now calls the actual backend instead of returning mock data.
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
    if (!data.questions) {
        throw new Error("Backend did not return questions in the expected format.");
    }
    
    return data.questions;
  },

  async evaluateAnswer(question: string, answer: string) {
    // Simulate AI answer evaluation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const score = Math.floor(Math.random() * 3) + 7 // 7-10
    const feedback =
      score >= 9
        ? "Excellent answer! You provided specific examples and demonstrated clear understanding."
        : score >= 8
          ? "Good answer with room for improvement. Consider adding more specific examples."
          : "Your answer covers the basics but could benefit from more detail and concrete examples."

    return { score, feedback }
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

// --- Live AI Interview API Functions ---

export async function startInterview(role: string, difficulty: string, num_questions: number) {
  const response = await fetch("http://localhost:8000/interview/start/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, difficulty, num_questions }),
  });
  if (!response.ok) {
    throw new Error("Failed to start interview");
  }
  return await response.json();
}

export async function evaluateAnswer(question: string, answer: string) {
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
}