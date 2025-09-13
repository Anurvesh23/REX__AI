import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  subscription_tier: "free" | "pro" | "enterprise"
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_id: string
  original_resume_text: string
  parsed_resume_json?: any
  job_description?: string
  ai_score?: number
  ats_score?: number
  keyword_match_score?: number
  suggestions: any[]
  keywords_matched: string[]
  keywords_missing: string[]
  cover_letter?: string
  optimized_resume_text?: string
  download_url?: string
  file_name?: string
  file_size?: number
  analysis_status: "pending" | "processing" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  user_id: string
  job_role: string
  interview_type: "technical" | "behavioral" | "mixed"
  settings: {
    num_questions: number
    difficulty: string
    focus_areas: string[]
  }
  questions: Array<{
    id: number
    question: string
    category: string
    difficulty: string
  }>
  answers: Array<{
    question_id: number
    answer: string
    score: number
    feedback: string
    time_taken: number
  }>
  overall_score?: number
  category_scores: {
    clarity: number
    confidence: number
    technical_knowledge: number
    communication: number
  }
  feedback?: string
  suggestions: string[]
  duration_minutes?: number
  status: "in_progress" | "completed" | "abandoned"
  created_at: string
  updated_at: string
}

export interface SavedJob {
  id: string
  user_id: string
  job_title: string
  company: string
  location?: string
  salary_range?: string
  job_type?: string
  description?: string
  requirements: string[]
  benefits: string[]
  match_score?: number
  external_url?: string
  application_status: "saved" | "applied" | "interviewing" | "rejected" | "accepted"
  notes?: string
  created_at: string
  updated_at: string
}
