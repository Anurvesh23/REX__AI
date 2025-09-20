// lib/types.ts

/**
 * Defines the structure for a saved resume analysis.
 */
export interface Resume {
  id: string;
  user_id: string;
  created_at: string;
  job_title: string;
  job_description: string;
  overall_score: number;
  feedback: string;
  suggestions: string[];
}

/**
 * Defines the structure for a completed mock interview session.
 * This version includes detailed metrics for a comprehensive review.
 */
export interface Interview {
  id: string;
  user_id: string;
  created_at: string;
  job_role: string;
  difficulty: "easy" | "medium" | "hard";
  overall_score: number;
  total_questions: number;
  correct_answers: number;
  answered_questions: number;
  category_scores: Record<string, number>; // e.g., { "Technical Skills": 80, "Behavioral": 90 }
  feedback: string;
  suggestions: string[];
  duration_minutes: number;
  questions: any[]; // The full list of questions asked
  answers: any[];   // The user's answers, including feedback for each
}

/**
 * Defines the possible application statuses for a saved job.
 * This provides a consistent set of states for the job tracking feature.
 */
export type ApplicationStatus = "Saved" | "Applied" | "Interviewing" | "Offer" | "Rejected";

/**
 * Defines the structure for a job listing saved by the user.
 */
export interface SavedJob {
  id: string;
  user_id: string;
  created_at: string;
  job_title: string;
  company_name: string;
  job_description: string;
  application_status: ApplicationStatus;
  job_url?: string; // Optional link to the original job posting
  location?: string; // Optional job location
}