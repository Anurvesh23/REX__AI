// lib/types.ts

/**
 * Defines the structure for a saved resume analysis.
 */
export interface Resume {
  id: string;
  user_id: string;
  created_at: string;
  job_title: string;
  overall_score: number;
  // You can add other fields from your analysis here
  // e.g., summary: string; keywords: string[];
}

/**
 * Defines the structure for a completed mock interview session.
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
  category_scores: Record<string, number>; // e.g., { "React": 80, "JavaScript": 90 }
  feedback: string;
  suggestions: string[];
  duration_minutes: number;
  questions: any[]; // The questions asked
  answers: any[];   // The user's answers with feedback
}

/**
 * Defines the possible application statuses for a saved job.
 */
export type ApplicationStatus = "Saved" | "Applied" | "Interviewing" | "Offered" | "Rejected";

/**
 * Defines the structure for a job listing saved by the user.
 */
export interface SavedJob {
  id: string;
  user_id: string;
  created_at: string;
  job_title: string;
  company_name: string;
  job_url?: string;
  location?: string;
  application_status: ApplicationStatus;
}