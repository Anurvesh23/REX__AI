"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import RoleSelection from "./role-selection"
import DifficultySelection from "./difficulty-selection"
import GeneratingQuestions from "./generating-questions"
import Guidelines from "./guidelines"
import InterviewSession from "./interview-session"
import FeedbackDisplay from "./feedback-display"
import { startInterview } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

interface InterviewSettings {
  num_questions: number;
  difficulty: "easy" | "medium" | "hard";
  job_role: string;
  time_per_question: number;
  time_limit: boolean;
}

type InterviewStep = "selection" | "difficulty" | "generating" | "guidelines" | "interview" | "results";

export default function MockInterviewPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<InterviewStep>("selection")
  const [settings, setSettings] = useState<InterviewSettings>({
    num_questions: 10,
    difficulty: "medium",
    job_role: "",
    time_per_question: 1.5,
    time_limit: true,
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [interviewResults, setInterviewResults] = useState<any>(null)

  const handleRoleSelect = (role: string) => {
    setSettings((prev) => ({ ...prev, job_role: role }))
    setCurrentStep("difficulty")
  }

  const handleDifficultySelectAndStart = async (difficulty: "easy" | "medium" | "hard") => {
    // Combine setting difficulty and starting the interview process
    const currentSettings = { ...settings, difficulty };
    setSettings(currentSettings);
    setCurrentStep("generating");

    try {
      const data = await startInterview(currentSettings.job_role, difficulty, currentSettings.num_questions);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentStep("guidelines");
      } else {
        throw new Error("AI did not return any questions.");
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("There was an error generating questions from the AI. Please try again.");
      setCurrentStep("difficulty"); // Revert to difficulty selection on error
    }
  }
  
  const handleStartTest = () => {
    setCurrentStep("interview");
  }

  const handleInterviewComplete = (answers: any[]) => {
    const correctAnswers = answers.filter(a => a.is_correct).length;
    const totalQuestions = questions.length;
    const overallScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const results = {
      questions,
      answers,
      overall_score: overallScore,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
    }

    setInterviewResults(results)
    setCurrentStep("results")
  }

  const handleRestart = () => {
    setCurrentStep("selection")
    setQuestions([])
    setInterviewResults(null)
    setSettings((prev) => ({ ...prev, job_role: "", difficulty: "medium" }))
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "selection":
        return <RoleSelection onSelectRole={handleRoleSelect} />
      case "difficulty":
        return <DifficultySelection role={settings.job_role} onSelectDifficulty={handleDifficultySelectAndStart} />
      case "generating":
        return <GeneratingQuestions />;
      case "guidelines":
        return <Guidelines role={settings.job_role} settings={settings} onStartTest={handleStartTest} />
      case "interview":
        return questions.length > 0 ? (
          <InterviewSession
            questions={questions}
            settings={settings}
            onComplete={handleInterviewComplete}
          />
        ) : <GeneratingQuestions />;
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
                <span className="text-2xl font-bold text-slate-900 dark:text-white">AI Skill Test</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">AI-Powered</Badge>
              {currentStep !== "selection" && currentStep !== "generating" && (
                <Button variant="outline" onClick={handleRestart}>
                  Start New Test
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderCurrentStep()}</main>
    </div>
  )
}