Rex--AI
Rex--AI is an innovative, AI-powered career transformation platform designed to empower job seekers. Built with a modern stack including Next.js, Python, FastAPI, and Supabase, Rex--AI offers a comprehensive suite of tools to streamline the job application process and provide actionable, data-driven feedback for career growth.

Features
AI-Powered Resume Analysis: Get an instant, detailed review of your resume against a job description, complete with an AI-generated score, keyword analysis, and actionable suggestions for improvement.

Mock Interviews: Practice for real-world interviews with company-specific and role-specific simulations powered by AI.

Mock Skill Tests: Sharpen your skills with AI-generated multiple-choice question tests, and receive real-time feedback and performance scores.

Intelligent Job Search: Discover curated job suggestions and save opportunities with personalized AI filters.

User Authentication: Secure sign-up, sign-in, and sign-out functionality using Supabase Auth.

Modern, Responsive UI: A sleek and intuitive user interface built with Next.js, Tailwind CSS, and shadcn/ui.

Tech Stack
Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion

Backend: Python, FastAPI

Database: Supabase (PostgreSQL)

Authentication: Supabase Auth

AI/ML: Google Gemini, Sentence Transformers, spaCy

Getting Started
Prerequisites
Node.js (v18 or higher recommended)

pnpm (preferred) or npm

Python (v3.8 or higher)

Installation
Clone the repository:

Bash

git clone https://github.com/Anurvesh23/Rex--AI.git
cd Rex--AI
Frontend Setup:

Bash

pnpm install
# or
npm install
Backend Setup:

Bash

cd backend
python -m venv venv
source venv/bin/activate # on Windows use `venv\Scripts\activate`
pip install -r requirements.txt
Environment Variables:

Create a .env.local file in the project root and add your Supabase and Google API credentials:

Code snippet

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
GOOGLE_API_KEY=your-google-api-key-here
Running the Development Servers
Run the Frontend:

Bash

pnpm run dev
# or
npm run dev
Run the Backend:

Bash

cd backend
uvicorn api.main:app --reload
Open http://localhost:3000 to view the app in your browser. The backend will be running on http://localhost:8000.

Project Structure
app/ - Next.js app directory (pages, layouts, features)

backend/ - FastAPI backend server and AI/ML logic

components/ - Reusable UI components

hooks/ - Custom React hooks

lib/ - API, Supabase, and utility functions for the frontend

public/ - Static assets

styles/ - Global styles

supabase/ - Supabase schema and migrations

Contributing
Contributions are welcome! Please open issues or pull requests for improvements and bug fixes.

License
MIT