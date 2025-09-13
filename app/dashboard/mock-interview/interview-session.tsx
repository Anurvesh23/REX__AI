"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock, ArrowRight, RotateCcw, Pause, Play, CheckCircle, AlertTriangle } from "lucide-react"

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
  const [timeLeft, setTimeLeft] = useState(settings.time_limit ? settings.time_per_question * 60 : null)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Timer effect
  useEffect(() => {
    if (!settings.time_limit || isPaused || timeLeft === null) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleNextQuestion() // Auto-advance when time runs out
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [settings.time_limit, isPaused, timeLeft])

  // Reset timer for new question
  useEffect(() => {
    if (settings.time_limit) {
      setTimeLeft(settings.time_per_question * 60)
    }
    setStartTime(Date.now())
  }, [currentQuestionIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim() && !settings.time_limit) return

    setIsEvaluating(true)
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    try {
      // Evaluate the answer if there is one
      let evaluation = { score: 0, feedback: "No answer provided" }
      if (currentAnswer.trim()) {
        evaluation = await onEvaluateAnswer(currentQuestion.question, currentAnswer)
      }

      const newAnswer: Answer = {
        question_id: currentQuestion.id,
        answer: currentAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        time_taken: timeTaken,
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      if (isLastQuestion) {
        onComplete(updatedAnswers)
      } else {
        setCurrentQuestionIndex((prev) => prev + 1)
        setCurrentAnswer("")
      }
    } catch (error) {
      console.error("Failed to evaluate answer:", error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const getQuestionCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "behavioral":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {settings.time_limit && timeLeft !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className={`text-sm font-mono ${timeLeft < 30 ? "text-red-600" : ""}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handlePauseResume} className="ml-2">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
        </CardContent>
      </Card>

      {/* Current Question */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Interview Question
              </CardTitle>
              <div className="flex gap-2">
                <Badge className={getQuestionCategoryColor(currentQuestion.category)}>{currentQuestion.category}</Badge>
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
              <p className="text-lg font-medium text-blue-900 dark:text-blue-100">{currentQuestion.question}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Answer</label>
                <Textarea
                  placeholder="Take your time to think through your response. Use the STAR method for behavioral questions (Situation, Task, Action, Result)."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-[200px] resize-none"
                  disabled={isPaused}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                  <span>{currentAnswer.length} characters</span>
                  {timeLeft !== null && timeLeft < 60 && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Less than 1 minute remaining
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleNextQuestion} disabled={isEvaluating || isPaused} className="flex-1">
                  {isEvaluating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="mr-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </motion.div>
                      Evaluating Answer...
                    </>
                  ) : (
                    <>
                      {isLastQuestion ? "Complete Interview" : "Next Question"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={() => setCurrentAnswer("")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interview Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">For Technical Questions:</h4>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Explain your thought process step by step</li>
                <li>• Consider edge cases and trade-offs</li>
                <li>• Use specific examples from your experience</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">For Behavioral Questions:</h4>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                <li>• Be specific with metrics and outcomes</li>
                <li>• Show learning and growth from experiences</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Answers Summary */}
      {answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Previous Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div
                  key={answer.question_id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Question {index + 1}</div>
                      <div className="text-xs text-slate-500">
                        {Math.floor(answer.time_taken / 60)}m {answer.time_taken % 60}s
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {answer.score && (
                      <Badge variant={answer.score >= 8 ? "default" : answer.score >= 6 ? "secondary" : "destructive"}>
                        {answer.score}/10
                      </Badge>
                    )}
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
