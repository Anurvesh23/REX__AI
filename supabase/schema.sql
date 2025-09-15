-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_resume_text TEXT NOT NULL,
    parsed_resume_json JSONB,
    job_description TEXT,
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    keyword_match_score INTEGER CHECK (keyword_match_score >= 0 AND keyword_match_score <= 100),
    suggestions JSONB DEFAULT '[]'::jsonb,
    keywords_matched JSONB DEFAULT '[]'::jsonb,
    keywords_missing JSONB DEFAULT '[]'::jsonb,
    cover_letter TEXT,
    optimized_resume_text TEXT,
    download_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_role TEXT NOT NULL,
    interview_type TEXT DEFAULT 'mixed' CHECK (interview_type IN ('technical', 'behavioral', 'mixed')),
    settings JSONB DEFAULT '{
        "num_questions": 10,
        "difficulty": "medium",
        "focus_areas": ["general", "technical"]
    }'::jsonb,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    category_scores JSONB DEFAULT '{
        "clarity": 0,
        "confidence": 0,
        "technical_knowledge": 0,
        "communication": 0
    }'::jsonb,
    feedback TEXT,
    suggestions JSONB DEFAULT '[]'::jsonb,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job searches table (for tracking saved jobs and applications)
CREATE TABLE job_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_query TEXT,
    filters JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved jobs table
CREATE TABLE saved_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    job_type TEXT,
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    external_url TEXT,
    application_status TEXT DEFAULT 'saved' CHECK (application_status IN ('saved', 'applied', 'interviewing', 'rejected', 'accepted')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    email_notifications BOOLEAN DEFAULT true,
    auto_delete_resumes_days INTEGER DEFAULT 30,
    default_interview_settings JSONB DEFAULT '{
        "num_questions": 10,
        "interview_type": "mixed",
        "difficulty": "medium"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_created_at ON interviews(created_at DESC);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_status ON saved_jobs(application_status);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interviews" ON interviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own interviews" ON interviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own job searches" ON job_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own job searches" ON job_searches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved jobs" ON saved_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);