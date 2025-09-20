"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import UploadResume from "./upload-resume"
import ResultsPanel from "./results-panel"
import { resumeAPI } from '@/lib/api'
import { useAuth } from "@/hooks/useAuth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { extractTextFromFile } from "@/lib/utils"

export default function ResumeAnalyzerPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState<"upload" | "results">("upload")
    const [resumeData, setResumeData] = useState<{ resumeFile: File | null; jobDescription: string; resumeText: string } | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [optimizedResumeText, setOptimizedResumeText] = useState("")
    const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false)
    const [coverLetterContent, setCoverLetterContent] = useState("")
    const [isDownloadingAiResume, setIsDownloadingAiResume] = useState(false);

    const generateOptimizedResumePreview = (originalText: string, analysis: any): string => {
        if (!analysis) return originalText;

        const userName = user?.user_metadata?.full_name || "Your Name";
        const userEmail = user?.email || "your.email@example.com";
        // You might want to get phone and location from user profile or prompt the user for it
        const userPhone = "[Your Phone Number]"; // Consider adding this to user profile or a separate input
        const userLocation = "[Your Location]"; // Consider adding this to user profile or a separate input
        const userLinkedIn = "[your-linkedin-url]"; // Consider adding this to user profile or a separate input

        // Helper to extract sections from the original resume text
        const getSectionText = (sectionTitle: string, fullText: string): string => {
            // This regex tries to find a section title (e.g., "SUMMARY") followed by content,
            // until another uppercase section title or the end of the document.
            // It's a best-effort approach and might need tweaking based on resume formats.
            const regex = new RegExp(`^${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n^[A-Z][A-Z\\s]*\\n|$)`, 'im');
            const match = fullText.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
            return `[Could not automatically extract your ${sectionTitle.toLowerCase()} section. Please review your original resume and update this section manually in the generated PDF.]`;
        };

        const missingKeywords = analysis.keywords_missing || [];
        const aiSuggestions = analysis.suggestions || [];

        // Extract sections from the original resume
        const originalSummary = getSectionText("SUMMARY", originalText);
        const originalSkills = getSectionText("SKILLS", originalText);
        const originalExperience = getSectionText("EXPERIENCE", originalText);
        const originalEducation = getSectionText("EDUCATION", originalText);
        const originalCertifications = getSectionText("LICENSES & CERTIFICATIONS", originalText) || getSectionText("CERTIFICATIONS", originalText);


        // Construct AI insights for each section
        const summaryInsight = aiSuggestions.filter((s:any) => s.category === "Content" && s.title.toLowerCase().includes("summary"))
                               .map((s:any) => s.description).join(' ');
        const skillsInsight = aiSuggestions.filter((s:any) => s.category === "Keywords" || (s.category === "Content" && s.title.toLowerCase().includes("skills")))
                               .map((s:any) => s.description).join(' ');
        const experienceInsight = aiSuggestions.filter((s:any) => s.category === "Experience")
                                  .map((s:any) => s.description).join(' ');


        return `
===================================================
                AI-POWERED RESUME REVISION
===================================================

This draft has been restructured for ATS compatibility and human readability, 
incorporating the AI analysis of your resume against the job description.

---------------------------------------------------
${userName.toUpperCase()}
${userEmail} | ${userPhone} | ${userLocation}
LinkedIn: ${userLinkedIn}
---------------------------------------------------

**SUMMARY**
(AI Insight: ${summaryInsight || 'Your summary has been refined for conciseness and impact, targeting the job description.'})

${originalSummary}

---------------------------------------------------

**SKILLS**
(AI Insight: ${skillsInsight || 'This section is organized for clarity. Consider integrating missing keywords for better alignment.'})

${originalSkills}
${missingKeywords.length > 0 ? `* **Keywords to Integrate:** ${missingKeywords.join(', ')}` : ''}

---------------------------------------------------

**EXPERIENCE**
(AI Insight: ${experienceInsight || 'Bullet points are rephrased using the STAR method for greater impact and to include quantifiable achievements.'})

${originalExperience}

---------------------------------------------------

**EDUCATION**

${originalEducation}

${originalCertifications && originalCertifications !== "[Could not automatically extract your certifications section. Please review your original resume and update this section manually in the generated PDF.]" ? `
---------------------------------------------------

**LICENSES & CERTIFICATIONS**

${originalCertifications}
` : ''}
===================================================
                      END OF REVISION
===================================================
`;
    };

    const handleAnalyze = async (resumeFile: File, jobDescription: string) => {
        setIsAnalyzing(true);
        try {
            // Extract text from the resume file on the client-side for the preview generator
            const originalText = await extractTextFromFile(resumeFile);
            if (!originalText) {
                throw new Error("Could not read text from the uploaded file.");
            }
            setResumeData({ resumeFile, jobDescription, resumeText: originalText });

            // Call the API with the file object and job description
            const results = await resumeAPI.analyzeResume(resumeFile, jobDescription);
            setAnalysisResult(results);
            
            // Generate the optimized resume text preview
            const optimizedText = generateOptimizedResumePreview(originalText, results);
            setOptimizedResumeText(optimizedText);
            
            setCurrentStep("results");
        } catch (error) {
            console.error("Analysis failed:", error);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: error instanceof Error ? error.message : "There was an error analyzing your resume. Please try again.",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!resumeData) return;
        toast({ title: "Generating Cover Letter...", description: "Please wait while our AI works its magic." });
        try {
            const letter = await resumeAPI.generateCoverLetter(resumeData.resumeText, resumeData.jobDescription);
            setCoverLetterContent(letter || "Could not generate cover letter.");
            setIsCoverLetterOpen(true);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: "Could not generate a cover letter. Please try again.",
            });
        }
    };

    const handlePreviewResume = () => {
        if (!optimizedResumeText) return;
        setIsPreviewOpen(true);
    };

    const handleDownloadReport = async () => {
        if (!analysisResult) return;
        toast({ title: "Generating PDF Report..." });
        try {
            const blob = await resumeAPI.generateAnalysisReport(analysisResult);
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
    };

    const handleDownloadAiResume = async () => {
        if (!optimizedResumeText) return;
        setIsDownloadingAiResume(true);
        try {
            const blob = await resumeAPI.generateAiResumePdf(optimizedResumeText);
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
            // The user_id is handled by the backend via the JWT, so we only send analysis data
            const savedData = await resumeAPI.saveAnalysis(analysisResult);
            toast({
                title: "Success!",
                description: savedData.message || "Analysis saved successfully.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save the analysis. Please try again.",
            });
        }
    };

    const handleStartOver = () => {
        setAnalysisResult(null);
        setResumeData(null);
        setCurrentStep("upload");
    };

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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentStep === "upload" ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI-Powered Resume Analysis</h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Upload your resume and paste the job description to get a detailed analysis, including skills match, experience relevance, and optimization recommendations.
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
            </main>

            {/* AI Resume Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>AI-Optimized Resume Preview</DialogTitle>
                        <DialogDescription>
                            This is a template demonstrating how your resume could be enhanced based on AI suggestions.
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