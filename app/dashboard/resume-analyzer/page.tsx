"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft } from "lucide-react"
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

  const generateOptimizedResumePreview = (originalText: string, analysis: any): string => {
    if (!analysis) return originalText;

    const suggestionsList = analysis.suggestions?.map((s: any) => `    * ${s.title}: ${s.description}`).join('\n') || '    * No specific suggestions provided.';
    const missingKeywordsText = analysis.keywords_missing?.join(', ') || 'None';
    const matchedKeywordsText = analysis.keywords_matched?.join(', ') || 'None';

    // A simple heuristic to grab the first few lines as a summary placeholder
    const summaryPlaceholder = originalText.split('\n').slice(0, 5).join('\n');

    return `
===================================================
           AI-OPTIMIZED RESUME DRAFT
===================================================
This draft incorporates ATS-friendly formatting and integrates suggestions 
from the AI analysis to improve your chances of passing automated screenings.

---------------------------------------------------
AI OPTIMIZATION SUMMARY & ACTION PLAN
---------------------------------------------------

* **Overall Match Score:** ${analysis.overall_score}%
* **ATS Compatibility Score:** ${analysis.ats_score}%
* **Your Action Plan:**
    1.  **Integrate Missing Keywords:** Weave the following keywords naturally into your experience and skills sections:
        ${missingKeywordsText}
    2.  **Address Key Suggestions:** Focus on these top recommendations to improve your resume's impact:
${suggestionsList}

---------------------------------------------------
[Your Name - e.g., Jane Doe]
[Your Contact Info - e.g., (123) 456-7890 | jane.doe@email.com | linkedin.com/in/janedoe]
---------------------------------------------------

**PROFESSIONAL SUMMARY**
(AI Suggestion: Start with a powerful 2-3 sentence summary tailored to the job description. Mention your years of experience and top 2-3 skills relevant to the role.)

${summaryPlaceholder}
...

**SKILLS**
(AI Suggestion: Ensure this section is clearly formatted with bullet points or a comma-separated list for easy parsing by ATS.)

* **Skills Matched with Job Description:** ${matchedKeywordsText}
* **Skills to Add from Job Description:** ${missingKeywordsText}

**PROFESSIONAL EXPERIENCE**
(AI Suggestion: Use the STAR method (Situation, Task, Action, Result) for your bullet points. Start each point with a strong action verb and include quantifiable results.)

**[Company Name]** — [Your Role] | [City, State] | [Start Date – End Date]
* **Original Bullet Point Example:** "Responsible for managing project timelines."
* **AI-Optimized Example:** "Successfully managed 5+ software development projects simultaneously, delivering all projects on average 10% ahead of schedule by implementing an agile workflow."

... (Continue this format for all roles) ...

[The rest of your original resume text would be restructured into this clear, scannable format.]

**EDUCATION**
**[University Name]** — [City, State]
[Degree Name], [Graduation Date]

---------------------------------------------------
            END OF OPTIMIZED DRAFT
---------------------------------------------------
`;
  };


  const handleAnalyze = async (resumeFile: File, jobDescription: string) => {
    setIsAnalyzing(true)
    setResumeData({ resumeFile, jobDescription })
    try {
      const result = await analyzeResumeBackend(resumeFile, jobDescription)
      setAnalysisResult(result)
      const originalText = await resumeFile.text();
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
        resumeText = await resumeData.resumeFile.text();
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

  const handleDownloadPDF = async () => {
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
            onDownloadPDF={handleDownloadPDF}
            onSaveAnalysis={handleSaveAnalysis}
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