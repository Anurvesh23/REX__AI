"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight, SkipForward, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Question {
  id: number
  question: string
  category: string
  difficulty: string
  options: string[]
  correctAnswer: string
}

interface Answer {
  question_id: number
  question_text: string
  selected_answer: string | null
  correct_answer: string
  is_correct: boolean
  time_taken: number
}

interface InterviewSessionProps {
  questions: Question[]
  settings: any
  onComplete: (answers: Answer[]) => void
  // The onEvaluateAnswer prop is now removed from here as well
}

export default function InterviewSession({ questions, settings, onComplete }: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  
  const totalDurationSeconds = (settings.num_questions || 10) * (settings.time_per_question || 1.5) * 60;
  const [timeLeft, setTimeLeft] = useState(totalDurationSeconds)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(userAnswers);
          return 0;
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [userAnswers, onComplete])
  
  useEffect(() => {
    setStartTime(Date.now())
    setSelectedOption(null)
  }, [currentQuestionIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (skipped = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answerText = skipped ? null : selectedOption;

    const newAnswer: Answer = {
      question_id: currentQuestion.id,
      question_text: currentQuestion.question,
      selected_answer: answerText,
      correct_answer: currentQuestion.correctAnswer,
      is_correct: answerText === currentQuestion.correctAnswer,
      time_taken: timeTaken,
    };
    
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (isLastQuestion) {
      onComplete(updatedAnswers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 flex-grow mr-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 flex-1 rounded-full",
                index < userAnswers.length ? "bg-primary" : "bg-slate-200 dark:bg-slate-700",
                index === currentQuestionIndex && "bg-blue-500"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 font-semibold text-red-600 bg-red-100 dark:bg-red-900/20 px-3 py-1.5 rounded-md flex-shrink-0">
          <Clock className="h-5 w-5" />
          <span>Time Left: {formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-5 flex flex-col"
        >
          <div className="flex-grow space-y-4">
            <h2 className="text-xl font-semibold">
              Question {currentQuestionIndex + 1}
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                {currentQuestion.difficulty}
              </Badge>
            </h2>
            <p className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>
          <Button variant="destructive" className="mt-8 w-fit" onClick={() => onComplete(userAnswers)}>
            Finish Test
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-7"
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ""} className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <Label 
                    key={index} 
                    htmlFor={`option-${index}`}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} className="mr-4" />
                    <span className="text-base">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || !selectedOption}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isLastQuestion ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isLastQuestion ? "Submit & Finish" : "Submit & Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}