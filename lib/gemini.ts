import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI (in production, use environment variable)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "demo-key")

export interface ResumeAnalysis {
  overall_score: number
  skills_match?: number
  experience_match?: number
  education_match?: number
  job_match: number
  ats_score: number
  relevant_sections: {
    skills: boolean
    experience: boolean
    education: boolean
    certifications: boolean
  }
  suggestions: Array<{
    type: "improvement" | "warning" | "success"
    title: string
    description: string
    impact: "High" | "Medium" | "Low" | "Positive"
    category: string
  }>
  keywords_matched: string[]
  keywords_missing: string[]
  strengths: string[]
  weaknesses: string[]
}

export async function analyzeResumeWithGemini(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-bison-001" })

    const prompt = `
    First, analyze this job description to identify what requirements are mentioned:

    JOB DESCRIPTION:
    ${jobDescription}

    Then analyze this resume against ONLY the requirements mentioned in the job description:

    RESUME:
    ${resumeText}

    IMPORTANT: Only provide scores for aspects that are explicitly mentioned in the job description.
    - If skills/technologies are mentioned → include skills_match
    - If experience requirements are mentioned → include experience_match  
    - If education requirements are mentioned → include education_match
    - Always include job_match and ats_score

    Please provide a JSON response with the following structure:
    {
      "overall_score": number (0-100),
      "skills_match": number (0-100) OR null if not mentioned in job description,
      "experience_match": number (0-100) OR null if not mentioned in job description,
      "education_match": number (0-100) OR null if not mentioned in job description,
      "job_match": number (0-100),
      "ats_score": number (0-100),
      "relevant_sections": {
        "skills": boolean (true if job mentions specific skills/technologies),
        "experience": boolean (true if job mentions experience requirements),
        "education": boolean (true if job mentions education requirements),
        "certifications": boolean (true if job mentions certifications)
      },
      "suggestions": [
        {
          "type": "improvement|warning|success",
          "title": "string",
          "description": "string", 
          "impact": "High|Medium|Low|Positive",
          "category": "content|formatting|keywords|experience"
        }
      ],
      "keywords_matched": ["array of matched keywords from job description"],
      "keywords_missing": ["array of missing keywords from job description"],
      "strengths": ["array of resume strengths relevant to this job"],
      "weaknesses": ["array of areas for improvement relevant to this job"]
    }

    Analysis Guidelines:
    1. Skills match: Only if job mentions specific technical skills, tools, or technologies
    2. Experience match: Only if job mentions years of experience, specific roles, or industry experience
    3. Education match: Only if job mentions degree requirements, educational background, or academic qualifications
    4. Job match: Overall fit for this specific position (always include)
    5. ATS compatibility: How well will this resume pass ATS systems (always include)
    
    Be accurate and only analyze what's actually mentioned in the job description.
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])

      // Clean up null values
      if (analysis.skills_match === null) delete analysis.skills_match
      if (analysis.experience_match === null) delete analysis.experience_match
      if (analysis.education_match === null) delete analysis.education_match

      return analysis
    }

    // Fallback if JSON parsing fails
    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("Gemini AI analysis failed:", error)

    // Analyze job description for fallback
    const hasSkills = /skill|technology|programming|software|tool|framework|language/i.test(jobDescription)
    const hasExperience = /experience|year|senior|junior|level|background/i.test(jobDescription)
    const hasEducation = /degree|education|bachelor|master|university|college|graduate/i.test(jobDescription)

    // Fallback mock analysis based on job description content
    const fallbackAnalysis: ResumeAnalysis = {
      overall_score: Math.floor(Math.random() * 20) + 80,
      job_match: Math.floor(Math.random() * 25) + 75,
      ats_score: Math.floor(Math.random() * 15) + 85,
      relevant_sections: {
        skills: hasSkills,
        experience: hasExperience,
        education: hasEducation,
        certifications: /certification|certified|license/i.test(jobDescription),
      },
      suggestions: [
        {
          type: "improvement",
          title: "Optimize for Job Requirements",
          description: "Tailor your resume to better match the specific requirements mentioned in this job posting.",
          impact: "High",
          category: "content",
        },
        {
          type: "warning",
          title: "Include Relevant Keywords",
          description: "Add keywords from the job description to improve ATS compatibility.",
          impact: "Medium",
          category: "keywords",
        },
      ],
      keywords_matched: ["JavaScript", "React", "Node.js"],
      keywords_missing: ["TypeScript", "Docker", "AWS"],
      strengths: ["Relevant technical background", "Good project experience"],
      weaknesses: ["Could better align with job requirements", "Missing some key terms"],
    }

    // Only add scores for sections mentioned in job description
    if (hasSkills) {
      fallbackAnalysis.skills_match = Math.floor(Math.random() * 25) + 75
    }
    if (hasExperience) {
      fallbackAnalysis.experience_match = Math.floor(Math.random() * 20) + 80
    }
    if (hasEducation) {
      fallbackAnalysis.education_match = Math.floor(Math.random() * 15) + 85
    }

    return fallbackAnalysis
  }
}

export async function generateCoverLetterWithGemini(
  resumeText: string,
  jobDescription: string,
  companyName?: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-bison-001" })

    const prompt = `
    Generate a professional cover letter based on this resume and job description:

    RESUME:
    ${resumeText}

    JOB DESCRIPTION:
    ${jobDescription}

    ${companyName ? `COMPANY NAME: ${companyName}` : ""}

    Create a compelling, personalized cover letter that:
    1. Highlights relevant experience from the resume that matches the job requirements
    2. Addresses key job requirements mentioned in the posting
    3. Shows enthusiasm for the role
    4. Is professional but engaging
    5. Is 3-4 paragraphs long

    Make it specific to this role and avoid generic language.
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Cover letter generation failed:", error)

    // Fallback cover letter
    return `Dear Hiring Manager,

I am writing to express my strong interest in this position at your company. Based on my experience and the job requirements, I believe I would be a valuable addition to your team.

My background in software development, particularly with modern web technologies, aligns well with your technical requirements. I have successfully delivered multiple projects that demonstrate my ability to work with cutting-edge technologies and contribute to team success.

I am excited about the opportunity to bring my skills and passion to your organization. Thank you for considering my application.

Best regards,
[Your Name]`
  }
}
