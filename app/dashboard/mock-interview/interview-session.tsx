"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight, SkipForward, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils" // <-- ADD THIS LINE

interface Question {
  id: number
  question: string
  category: string
  difficulty: string
}

interface Answer {
  question_id: number
  answer: string
  score?: number
  feedback?: string
  time_taken: number
}

interface InterviewSessionProps {
  questions: Question[]
  settings: any
  onComplete: (answers: Answer[]) => void
  onEvaluateAnswer: (question: string, answer: string) => Promise<{ score: number; feedback: string }>
}

export default function InterviewSession({ questions, settings, onComplete, onEvaluateAnswer }: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  
  const [timeLeft, setTimeLeft] = useState(settings.time_limit ? settings.time_per_question * 60 : 15 * 60)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete(answers);
          return 0;
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [answers, onComplete])
  
  useEffect(() => {
    setStartTime(Date.now())
  }, [currentQuestionIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const submitAnswer = async (answerText: string) => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    let evaluation = { score: 0, feedback: "Answer was skipped." };
    if (answerText.trim()) {
      try {
        evaluation = await onEvaluateAnswer(currentQuestion.question, answerText);
      } catch (error) {
        console.error("Failed to evaluate answer:", error);
        evaluation.feedback = "Could not evaluate answer due to an error.";
      }
    }

    const newAnswer: Answer = {
      question_id: currentQuestion.id,
      answer: answerText,
      score: evaluation.score,
      feedback: evaluation.feedback,
      time_taken: timeTaken,
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      onComplete(updatedAnswers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer("");
    }
    setIsEvaluating(false);
  };

  const handleNext = () => {
    submitAnswer(currentAnswer);
  };

  const handleSkip = () => {
    submitAnswer("");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "h-8 w-8 rounded-md text-sm font-medium transition-colors",
                index === currentQuestionIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
              )}
              disabled={index > answers.length}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 font-semibold text-red-600 bg-red-100 dark:bg-red-900/20 px-3 py-1.5 rounded-md">
          <Clock className="h-5 w-5" />
          <span>Question Time Left: {formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Question Panel */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <div className="flex-grow space-y-4">
            <h2 className="text-xl font-semibold">
              Question {currentQuestionIndex + 1}
              <Badge variant="outline" className={`ml-2 ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </Badge>
            </h2>
            <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>
          <Button variant="destructive" className="mt-8 w-fit" onClick={() => onComplete(answers)}>
            Finish
          </Button>
        </motion.div>

        {/* Right: Answer Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Structure your answer clearly. For behavioral questions, consider using the STAR method."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="min-h-[250px] text-base"
                disabled={isEvaluating}
              />
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={handleSkip} disabled={isEvaluating}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
                <Button onClick={handleNext} disabled={isEvaluating || !currentAnswer.trim()}>
                  {isEvaluating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isLastQuestion ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isEvaluating ? "Evaluating..." : isLastQuestion ? "Submit & Finish" : "Submit & Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}