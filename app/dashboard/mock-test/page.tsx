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
import { interviewAPI } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface InterviewSettings {
  num_questions: number;
  difficulty: "easy" | "medium" | "hard";
  job_role: string;
  time_per_question: number;
  time_limit: boolean;
}

type InterviewStep = "selection" | "difficulty" | "generating" | "guidelines" | "interview" | "evaluating" | "results";

export default function MockTestPage() {
  const { user } = useAuth()
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<InterviewStep>("selection")
  const [settings, setSettings] = useState<InterviewSettings>({
    num_questions: 20,
    difficulty: "medium",
    job_role: "",
    time_per_question: 1.5,
    time_limit: true,
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [interviewResults, setInterviewResults] = useState<any>(null)

  const handleRoleSelect = (role: string) => {
    setSettings((prev) => ({ ...prev, job_role: role }));
    setCurrentStep("difficulty");
  }

  const handleDifficultySelect = async (difficulty: "easy" | "medium" | "hard") => {
    const newSettings = { ...settings, difficulty };
    setSettings(newSettings);
    setCurrentStep("generating");

    try {
      const data = await interviewAPI.generateQuestions(newSettings.job_role, newSettings.difficulty, { num_questions: newSettings.num_questions });
      if (data && data.length > 0) {
        setQuestions(data);
        setCurrentStep("guidelines");
      } else {
        throw new Error("AI did not return any questions.");
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error generating questions. Please try again.",
      });
      setCurrentStep("selection");
    }
  }

  const handleStartTest = () => {
    setCurrentStep("interview");
  }

  const handleInterviewComplete = async (answers: any[]) => {
    setCurrentStep("evaluating");
    try {
      const analysis = await interviewAPI.evaluateTest(questions, answers);
      const correctAnswersCount = answers.filter(a => a.is_correct).length;
      const answeredQuestionsCount = answers.filter(a => a.selected_answer !== null).length;
      const totalQuestions = questions.length;
      const overallScore = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

      const answersWithFeedback = answers.map(answer => {
        const feedbackItem = analysis.detailed_feedback.find((f: any) => f.question_id === answer.question_id);
        return { ...answer, feedback: feedbackItem ? feedbackItem.feedback : "No feedback available." };
      });

      const results = {
        questions,
        answers: answersWithFeedback,
        overall_score: overallScore,
        total_questions: totalQuestions,
        correct_answers: correctAnswersCount,
        answered_questions: answeredQuestionsCount,
        category_scores: analysis.category_scores,
        feedback: analysis.overall_feedback,
        suggestions: analysis.suggestions,
        duration_minutes: Math.round(answers.reduce((acc, a) => acc + a.time_taken, 0) / 60),
        job_role: settings.job_role,
        difficulty: settings.difficulty,
      }

      setInterviewResults(results);
      
      // --- Database Storage Enabled ---
      if (user) {
        try {
          await interviewAPI.saveInterview(user.id, results);
          toast({
            title: "Success!",
            description: "Your interview results have been saved to your profile.",
          });
        } catch (saveError) {
          console.error("Failed to save interview results:", saveError);
          toast({
            variant: "destructive",
            title: "Save Error",
            description: "Your results were processed, but we couldn't save them to your account.",
          });
        }
      }
      
      setCurrentStep("results");

    } catch (error) {
      console.error("Failed to evaluate test:", error);
      toast({
          variant: "destructive",
          title: "Evaluation Error",
          description: "Could not get performance feedback from the AI.",
      });
      
      // Fallback to showing results without detailed AI feedback if evaluation fails
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const answeredQuestions = answers.filter(a => a.selected_answer !== null).length;
      const totalQuestions = questions.length;
      setInterviewResults({
          questions,
          answers,
          overall_score: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          answered_questions: answeredQuestions,
      });
      setCurrentStep("results");
    }
  }

  const handleRestart = () => {
    setCurrentStep("selection")
    setQuestions([])
    setInterviewResults(null)
    setSettings((prev) => ({ ...prev, job_role: "", difficulty: "medium", num_questions: 20 }))
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "selection":
        return <RoleSelection onSelectRole={handleRoleSelect} />
      case "difficulty":
        return <DifficultySelection role={settings.job_role} onSelectDifficulty={handleDifficultySelect} />
      case "generating":
        return <GeneratingQuestions
          title="Preparing Your Assessment"
          description="Our AI is crafting personalized questions based on your requirements."
          loadingText="Generating questions..."
        />;
      case "evaluating":
        return <GeneratingQuestions
          title="Evaluating Your Answers"
          description="Our AI is analyzing your performance and generating feedback."
          loadingText="Evaluating answers..."
        />;
      case "guidelines":
        return <Guidelines role={settings.job_role} settings={settings} onStartTest={handleStartTest} />
      case "interview":
        return questions.length > 0 ? (
          <InterviewSession questions={questions} settings={settings} onComplete={handleInterviewComplete} />
        ) : <GeneratingQuestions title="Loading Test..." description="Please wait a moment." loadingText="Loading..." />;
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
                <span className="text-2xl font-bold text-slate-900 dark:text-white">AI Mock Test</span>
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