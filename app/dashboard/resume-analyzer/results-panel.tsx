"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/bar-chart"
import {
  Brain,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Eye,
  FileText,
  BookOpen,
  BarChart3,
  Info,
} from "lucide-react"
import type { ResumeAnalysis } from "@/lib/gemini"

interface ResultsPanelProps {
  analysisResult: ResumeAnalysis
  onGenerateCoverLetter: () => void
  onPreviewResume: () => void
  onDownloadPDF: () => void
  onSaveAnalysis: () => void
}

export default function ResultsPanel({
  analysisResult,
  onGenerateCoverLetter,
  onPreviewResume,
  onDownloadPDF,
  onSaveAnalysis,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 80) return "bg-blue-100 dark:bg-blue-900/20"
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "improvement":
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getImpactBadge = (impact: string) => {
    const variants = {
      High: "destructive",
      Medium: "default",
      Low: "secondary",
      Positive: "secondary",
    } as const

    return <Badge variant={variants[impact as keyof typeof variants] || "secondary"}>{impact}</Badge>
  }

  // Prepare bar chart data - only include metrics that are relevant to the job description
  const barChartData = []

  if (analysisResult.skills_match !== undefined) {
    barChartData.push({
      label: "Skills Match",
      value: analysisResult.skills_match,
      color: "#3B82F6", // blue
    })
  }

  if (analysisResult.experience_match !== undefined) {
    barChartData.push({
      label: "Experience Match",
      value: analysisResult.experience_match,
      color: "#10B981", // green
    })
  }

  if (analysisResult.education_match !== undefined) {
    barChartData.push({
      label: "Education Match",
      value: analysisResult.education_match,
      color: "#8B5CF6", // purple
    })
  }

  // Always include these
  barChartData.push(
    {
      label: "Job Match",
      value: analysisResult.job_match,
      color: "#F59E0B", // yellow
    },
    {
      label: "ATS Score",
      value: analysisResult.ats_score,
      color: "#EF4444", // red
    },
  )

  // Get sections not mentioned in job description
  const sectionsNotMentioned = []
  if (!analysisResult.relevant_sections?.skills) sectionsNotMentioned.push("Skills")
  if (!analysisResult.relevant_sections?.experience) sectionsNotMentioned.push("Experience")
  if (!analysisResult.relevant_sections?.education) sectionsNotMentioned.push("Education")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Resume Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysisResult.overall_score)}`}>
              {analysisResult.overall_score}/100
            </div>
            <div className="text-lg text-slate-600 dark:text-slate-400 mb-4">Overall Match Score</div>
            <Progress value={analysisResult.overall_score} className="max-w-md mx-auto h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Analysis Breakdown
          </CardTitle>
          {sectionsNotMentioned.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> {sectionsNotMentioned.join(", ")} requirements were not mentioned in the job
                description, so they're not included in this analysis.
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <BarChart data={barChartData} className="max-w-2xl mx-auto" />
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="strengths">Strengths & Weaknesses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {(analysisResult.strengths ?? []).map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {(analysisResult.weaknesses ?? []).map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Job Requirements Analysis */}
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Job Requirements Coverage</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">Mentioned in Job Description:</h4>
                    <ul className="space-y-1">
                      {analysisResult.relevant_sections?.skills && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Technical Skills</span>
                        </li>
                      )}
                      {analysisResult.relevant_sections?.experience && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Experience Requirements</span>
                        </li>
                      )}
                      {analysisResult.relevant_sections?.education && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Education Requirements</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Job Responsibilities</span>
                      </li>
                    </ul>
                  </div>
                  {sectionsNotMentioned.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-600">Not Specified in Job:</h4>
                      <ul className="space-y-1">
                        {sectionsNotMentioned.map((section, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                            <span className="text-slate-500">{section} Requirements</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0 mt-1">{getSuggestionIcon(suggestion.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{suggestion.title}</h3>
                        {getImpactBadge(suggestion.impact)}
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Matched Keywords ({analysisResult.keywords_matched.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords_matched.map((keyword, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Missing Keywords ({analysisResult.keywords_missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords_missing.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="border-red-200 text-red-600">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Keyword Optimization Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Naturally incorporate missing keywords from the job description</li>
                  <li>• Use both acronyms and full forms (e.g., "AI" and "Artificial Intelligence")</li>
                  <li>• Include keywords in your skills section and throughout your experience</li>
                  <li>• Match the exact terminology used in the job posting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm text-green-800 dark:text-green-200">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button onClick={onPreviewResume} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Resume
        </Button>

        <Button onClick={onDownloadPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download Report
        </Button>

        <Button onClick={onGenerateCoverLetter} variant="outline" className="flex items-center gap-2 bg-transparent">
          <BookOpen className="h-4 w-4" />
          Generate Cover Letter
        </Button>

        <Button onClick={onSaveAnalysis} variant="outline" className="flex items-center gap-2 bg-transparent">
          <FileText className="h-4 w-4" />
          Save Analysis
        </Button>
      </div>
    </motion.div>
  )
}