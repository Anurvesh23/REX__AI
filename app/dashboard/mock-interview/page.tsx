"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
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

export default function MockInterviewPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<"settings" | "interview" | "results">("settings")
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

  const handleStartInterview = async () => {
    setIsGeneratingQuestions(true)

    try {
      const generatedQuestions = await interviewAPI.generateQuestions(
        settings.job_role,
        undefined, // Resume text would be passed here
        settings,
      )

      setQuestions(generatedQuestions)
      setCurrentStep("interview")
    } catch (error) {
      console.error("Failed to generate questions:", error)
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleEvaluateAnswer = async (question: string, answer: string) => {
    return await interviewAPI.evaluateAnswer(question, answer)
  }

  const handleInterviewComplete = async (answers: any[]) => {
    // Calculate overall scores
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
        "Practice explaining complex concepts in simpler terms",
        "Work on providing more specific examples from your experience",
        "Consider the STAR method for behavioral questions",
      ],
      duration_minutes: Math.floor(answers.reduce((total, a) => total + a.time_taken, 0) / 60),
    }

    // Save interview if user opted to save answers
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

  const handleRestartInterview = () => {
    setCurrentStep("settings")
    setQuestions([])
    setInterviewResults(null)
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
                <MessageSquare className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">Mock Interview</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">AI-Powered</Badge>
              {currentStep !== "settings" && (
                <Button variant="outline" onClick={handleRestartInterview}>
                  New Interview
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "settings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI Mock Interview Setup</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Customize your interview experience and practice with AI-generated questions tailored to your role and
                experience level.
              </p>
            </div>

            <SettingsPanel settings={settings} onSettingsChange={setSettings} onStartInterview={handleStartInterview} />
          </motion.div>
        )}

        {currentStep === "interview" && (
          <InterviewSession
            questions={questions}
            settings={settings}
            onComplete={handleInterviewComplete}
            onEvaluateAnswer={handleEvaluateAnswer}
          />
        )}

        {currentStep === "results" && interviewResults && (
          <FeedbackDisplay results={interviewResults} onRestartInterview={handleRestartInterview} />
        )}
      </div>
    </div>
  )
}
