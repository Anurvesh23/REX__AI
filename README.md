# Rex--AI

Rex--AI is an AI-powered career transformation platform that helps users with job search, resume analysis, and mock interviews. Built with Next.js, Supabase, and modern UI components, Rex--AI streamlines the job application process and provides actionable feedback for career growth.

## Features
- User authentication (sign up, sign in, sign out)
- Resume analyzer with AI scoring and suggestions
- Job search and job management dashboard
- Mock interview sessions with feedback
- Modern, responsive UI

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (preferred) or npm

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Anurvesh23/Rex--AI.git
   cd Rex--AI
   ```
2. Install dependencies:
   ```sh
   pnpm install
   # or
   npm install
   ```
3. Create a `.env.local` file in the project root and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

### Running the Development Server
```sh
pnpm run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Project Structure
- `app/` - Next.js app directory (pages, layouts, features)
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `lib/` - API, Supabase, and utility functions
- `public/` - Static assets
- `styles/` - Global styles

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon public key

## Contributing
Contributions are welcome! Please open issues or pull requests for improvements and bug fixes.

## License
[MIT](LICENSE) 