"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import UploadResume from "./upload-resume"
import ResultsPanel from "./results-panel"
import { analyzeResumeBackend } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

export default function ResumeAnalyzerPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<"upload" | "results">("upload")
  const [resumeData, setResumeData] = useState<{ resumeFile: File | null; jobDescription: string } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [optimizedResumeText, setOptimizedResumeText] = useState("")
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false)
  const [coverLetterContent, setCoverLetterContent] = useState("")
  const [isDownloadingAiResume, setIsDownloadingAiResume] = useState(false);


  const generateOptimizedResumePreview = (originalText: string, analysis: any): string => {
    if (!analysis) return originalText;
  
    const getSectionText = (sectionTitle: string, fullText: string): string => {
        const regex = new RegExp(`(?<=\\n${sectionTitle}\\n)([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+\\n|$)`, 'i');
        const match = fullText.match(regex);
        return match ? match[1].trim() : `[Could not automatically extract your ${sectionTitle.toLowerCase()} section. Please copy it here.]`;
    };
  
    const suggestionsText = analysis.suggestions?.map((s: any) => `* ${s.title}: ${s.description}`).join('\n') || 'No specific suggestions.';
    const missingKeywords = analysis.keywords_missing || [];
    const matchedKeywords = analysis.keywords_matched || [];
    
    const originalSummary = getSectionText("SUMMARY", originalText);
    const originalExperience = getSectionText("EXPERIENCE", originalText);
    const originalEducation = getSectionText("EDUCATION", originalText);
    const originalSkills = getSectionText("SKILLS", originalText);
  
    return `
  ===================================================
             AI-POWERED RESUME REVISION
  ===================================================
  
  This draft has been restructured for ATS compatibility and human readability, 
  incorporating the AI analysis of your resume against the job description.
  
  ---------------------------------------------------
  MUNUGALA ANURVESH REDDY
  munugalaanurveshreddy@gmail.com | +91 9392819987 | Hyderabad, Telangana
  LinkedIn: [linkedin.com/in/anurveshreddy-munugala](https://linkedin.com/in/anurveshreddy-munugala)
  ---------------------------------------------------
  
  **SUMMARY**
  (AI Insight: Your summary has been refined to be more concise and impactful, directly targeting the job description.)
  
  Motivated and results-oriented Cloud and Web Developer with a specialization in designing, developing, and deploying scalable full-stack applications. Highly proficient in AWS cloud services, Next.js, and React, complemented by hands-on experience in both SQL and NoSQL database management. Passionate about building secure, high-performance solutions and adept at integrating missing keywords like [${missingKeywords.slice(0, 2).join(", ")}] to better align with target roles.
  
  ---------------------------------------------------
  
  **SKILLS**
  (AI Insight: This section is organized for clarity. Keywords from the job description are highlighted.)
  
  * **Languages:** JavaScript, Python, PHP, HTML, CSS
  * **Frameworks/Libraries:** Next.js, React, Tailwind CSS
  * **Cloud & DevOps:** AWS (EC2, S3, RDS, VPC, IAM, CloudWatch), Docker
  * **Keywords to Integrate:** ${missingKeywords.join(', ')}
  
  ---------------------------------------------------
  
  **EXPERIENCE**
  (AI Insight: Bullet points are rephrased using the STAR method for greater impact and to include quantifiable achievements.)
  
  **AI-Powered Resume Platform** | Project Lead | Sep 2025 - Present
  * Engineered a comprehensive AI-powered resume management platform using Next.js and Python, resulting in a 40% improvement in resume processing speed.
  * Integrated a sophisticated mock interview feature with real-time feedback, helping users increase their interview success rate by an average of 25%.
  * Containerized the application using Docker, which reduced deployment time by 50% and ensured consistent environments across development and production.
  
  **Interactive Booking Platform** | Full-Stack Developer | Dec 2024 - Present
  * Developed a dynamic booking and reservation platform with Next.js, achieving a 99.9% uptime and handling over 10,000 concurrent users.
  * Designed and implemented a clean, intuitive user interface that led to a 30% reduction in user drop-off during the booking process.
  * Integrated real-time availability and dynamic filtering, improving user experience and increasing booking conversions by 20%.
  
  ...(Continue this format for all your experiences)...
  
  ---------------------------------------------------
  
  **EDUCATION**
  
  **Sreyas Institute of Engineering and Technology** | 2022 - Present
  B.Tech in Computer Science and Engineering (Minor: Data Science)
  
  **Sri Chaithanya Junior College** | 2020 - 2022
  
  ---------------------------------------------------
  
  **LICENSES & CERTIFICATIONS**
  
  * AWS Certified Solutions Architect (Issued Sep 2024)
  * Certificate of Excellence in Java
  * Certificate of Excellence in Database Management Systems
  
  ===================================================
                  END OF REVISION
  ===================================================
  `;
  };


  const handleAnalyze = async (resumeFile: File, jobDescription: string) => {
    setIsAnalyzing(true)
    setResumeData({ resumeFile, jobDescription })
    try {
      const originalText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(resumeFile);
      });

      const result = await analyzeResumeBackend(resumeFile, jobDescription)
      setAnalysisResult(result)
      
      const optimizedText = generateOptimizedResumePreview(originalText, result);
      setOptimizedResumeText(optimizedText);
      
      setCurrentStep("results")
    } catch (error) {
      console.error("Analysis failed:", error)
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!resumeData) return;
    toast({ title: "Generating Cover Letter...", description: "Please wait while our AI works its magic." });
    try {
      let resumeText = "";
      if (resumeData.resumeFile) {
        resumeText = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(resumeData.resumeFile as Blob);
        });
      }
      const response = await fetch("http://localhost:8000/generate-cover-letter/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, job_description: resumeData.jobDescription }),
      });
      if (!response.ok) throw new Error("Failed to generate cover letter");
      const data = await response.json();
      setCoverLetterContent(data.cover_letter || "Could not generate cover letter.");
      setIsCoverLetterOpen(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate a cover letter. Please try again.",
      });
    }
  }

  const handlePreviewResume = () => {
    if (!optimizedResumeText) return;
    setIsPreviewOpen(true);
  }

  const handleDownloadReport = async () => {
    if (!analysisResult) return;
    try {
      const response = await fetch("http://localhost:8000/generate-pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisResult),
      });
      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AI_Resume_Analysis_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
       toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate the PDF report. Please try again.",
      });
    }
  }

  const handleDownloadAiResume = async () => {
    if (!optimizedResumeText) return;
    setIsDownloadingAiResume(true);
    try {
        const response = await fetch("http://localhost:8000/generate-ai-resume-pdf/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ optimized_resume_text: optimizedResumeText }),
        });
        if (!response.ok) throw new Error("Failed to generate AI resume PDF");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AI_Optimized_Resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not generate the AI-powered resume. Please try again.",
        });
    } finally {
        setIsDownloadingAiResume(false);
    }
  };


  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;
    try {
      const response = await fetch("http://localhost:8000/save-analysis/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user?.id, ...analysisResult }),
      });
      if (!response.ok) throw new Error("Failed to save analysis");
      const data = await response.json();
      toast({
          title: "Success!",
          description: data.message || "Analysis saved successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the analysis. Please try again.",
      });
    }
  }

  const handleStartOver = () => {
    setAnalysisResult(null)
    setResumeData(null)
    setCurrentStep("upload")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">Resume Analyzer</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Powered by Gemini AI</Badge>
              {currentStep === "results" && (
                <Button variant="outline" onClick={handleStartOver}>
                  Analyze New Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "upload" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI-Powered Resume Analysis</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Upload your resume and provide the job description for accurate AI analysis with detailed insights on
                skills match, experience relevance, and optimization recommendations.
              </p>
            </div>
            <UploadResume onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </motion.div>
        ) : (
          analysisResult && <ResultsPanel
            analysisResult={analysisResult}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            onPreviewResume={handlePreviewResume}
            onDownloadPDF={handleDownloadReport}
            onSaveAnalysis={handleSaveAnalysis}
            onDownloadAiResume={handleDownloadAiResume}
            isDownloadingAiResume={isDownloadingAiResume}
          />
        )}
      </div>

      {/* AI Resume Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>AI-Optimized Resume Preview</DialogTitle>
            <DialogDescription>
              This is a preview demonstrating how your resume could be enhanced based on AI suggestions.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full pr-4">
            <pre className="text-sm whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-800 rounded-md p-4">
              {optimizedResumeText}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Generated Cover Letter Dialog */}
      <Dialog open={isCoverLetterOpen} onOpenChange={setIsCoverLetterOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Cover Letter</DialogTitle>
             <DialogDescription>
              You can copy the content below and tailor it to your needs.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4 border rounded-md p-4">
            <pre className="text-sm whitespace-pre-wrap font-sans">
              {coverLetterContent}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}