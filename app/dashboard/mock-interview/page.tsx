"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import RoleSelection from "./role-selection" // New import
import SettingsPanel from "./settings-panel"
import InterviewSession from "./interview-session"
import FeedbackDisplay from "./feedback-display"
import { interviewAPI } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

interface InterviewSettings {
  num_questions: number
  interview_type: "technical" | "behavioral" | "mixed"
  difficulty: "easy" | "medium" | "hard"
  focus_areas: string[]
  job_role: string
  save_answers: boolean
  time_limit: boolean
  time_per_question: number
}

// Define a new type for the steps in our flow
type InterviewStep = "selection" | "settings" | "interview" | "results"

export default function MockInterviewPage() {
  const { user } = useAuth()
  // Update the state to include the new "selection" step
  const [currentStep, setCurrentStep] = useState<InterviewStep>("selection")
  const [settings, setSettings] = useState<InterviewSettings>({
    num_questions: 10,
    interview_type: "mixed",
    difficulty: "medium",
    focus_areas: [],
    job_role: "",
    save_answers: true,
    time_limit: false,
    time_per_question: 3,
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [interviewResults, setInterviewResults] = useState<any>(null)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)

  // New handler for when a user selects a role
  const handleRoleSelect = (role: string) => {
    // Pre-fill the job role in settings and move to the settings panel
    setSettings((prev) => ({
      ...prev,
      // Convert "Software Developer" to "software-developer" for the select component
      job_role: role.toLowerCase().replace(/\s+/g, "-"),
    }))
    setCurrentStep("settings")
  }

  const handleStartInterview = async () => {
    setIsGeneratingQuestions(true)
    try {
      const generatedQuestions = await interviewAPI.generateQuestions(
        settings.job_role,
        undefined, // Resume text would be passed here in a future update
        settings
      )
      setQuestions(generatedQuestions)
      setCurrentStep("interview")
    } catch (error) {
      console.error("Failed to generate questions:", error)
      // You can add a user-facing error message here
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleEvaluateAnswer = async (question: string, answer: string) => {
    return await interviewAPI.evaluateAnswer(question, answer)
  }

  const handleInterviewComplete = async (answers: any[]) => {
    const scores = answers.filter((a) => a.score).map((a) => a.score)
    const overallScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) : 0
    const categoryScores = {
      clarity: Math.floor(Math.random() * 20) + 80,
      confidence: Math.floor(Math.random() * 20) + 75,
      technical_knowledge: Math.floor(Math.random() * 25) + 75,
      communication: Math.floor(Math.random() * 15) + 80,
    }
    const results = {
      questions,
      answers,
      overall_score: overallScore,
      category_scores: categoryScores,
      feedback: "Great job overall! You demonstrated strong technical knowledge and communication skills.",
      suggestions: [
        "Practice explaining complex concepts in simpler terms.",
        "Work on providing more specific examples from your experience using the STAR method.",
      ],
      duration_minutes: Math.floor(answers.reduce((total, a) => total + a.time_taken, 0) / 60),
    }

    if (settings.save_answers && user) {
      try {
        await interviewAPI.saveInterview(user.id, {
          job_role: settings.job_role,
          interview_type: settings.interview_type,
          settings,
          questions,
          answers,
          overall_score: overallScore,
          category_scores: categoryScores,
          feedback: results.feedback,
          suggestions: results.suggestions,
          duration_minutes: results.duration_minutes,
          status: "completed",
        })
      } catch (error) {
        console.error("Failed to save interview:", error)
      }
    }

    setInterviewResults(results)
    setCurrentStep("results")
  }

  const handleRestart = () => {
    setCurrentStep("selection") // Go back to the role selection screen
    setQuestions([])
    setInterviewResults(null)
    setSettings((prev) => ({ ...prev, job_role: "", focus_areas: [] }))
  }

  // Helper to render the correct component based on the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "selection":
        return <RoleSelection onSelectRole={handleRoleSelect} />
      case "settings":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              onStartInterview={handleStartInterview}
            />
          </motion.div>
        )
      case "interview":
        return (
          <InterviewSession
            questions={questions}
            settings={settings}
            onComplete={handleInterviewComplete}
            onEvaluateAnswer={handleEvaluateAnswer}
          />
        )
      case "results":
        return interviewResults && <FeedbackDisplay results={interviewResults} onRestartInterview={handleRestart} />
      default:
        return <RoleSelection onSelectRole={handleRoleSelect} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
                <MessageSquare className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">Mock Interview</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">AI-Powered</Badge>
              {currentStep !== "selection" && (
                <Button variant="outline" onClick={handleRestart}>
                  Start New Interview
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderCurrentStep()}</main>
    </div>
  )
}