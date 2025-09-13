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


export default function ResumeAnalyzerPage() {
  const { user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<"upload" | "results">("upload")
  const [resumeData, setResumeData] = useState<{ resumeFile: File | null; jobDescription: string } | null>(null)

  const handleAnalyze = async (resumeFile: File, jobDescription: string) => {
    setIsAnalyzing(true)
    setResumeData({ resumeFile, jobDescription })
    try {
      const result = await analyzeResumeBackend(resumeFile, jobDescription)
      setAnalysisResult(result)
      setCurrentStep("results")
    } catch (error) {
      console.error("Analysis failed:", error)
      // Handle error - show toast notification
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate cover letter by calling backend
  const handleGenerateCoverLetter = async () => {
    if (!resumeData) {
      alert("No resume data available.");
      return;
    }
    try {
      // For now, we assume resumeData.resumeFile is a File, so we need to read its text
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
      // For now, just show the cover letter in an alert
      alert(data.cover_letter || "No cover letter generated.");
    } catch (err) {
      alert("Failed to generate cover letter. Please try again.");
    }
  }

  const handlePreviewResume = () => {
    if (!resumeData) return;
    alert("Resume preview is not available for file uploads. Please open your original file.");
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
      a.download = "AI_Resume_Analysis.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate PDF. Please try again.");
    }
  }

  const handleSaveAnalysis = async () => {
    if (!analysisResult) {
      alert("No analysis result to save.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/save-analysis/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisResult),
      });
      if (!response.ok) throw new Error("Failed to save analysis");
      const data = await response.json();
      alert(data.message || "Analysis saved.");
    } catch (err) {
      alert("Failed to save analysis. Please try again.");
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
          <ResultsPanel
            analysisResult={analysisResult}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            onPreviewResume={handlePreviewResume}
            onDownloadPDF={handleDownloadPDF}
            onSaveAnalysis={handleSaveAnalysis}
          />
        )}
      </div>
    </div>
  )
}
