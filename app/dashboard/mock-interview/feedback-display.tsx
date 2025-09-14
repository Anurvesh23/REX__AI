"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  TrendingUp,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Download,
  Share,
} from "lucide-react"

interface FeedbackDisplayProps {
  results: {
    questions: any[]
    answers: any[]
    overall_score: number
    category_scores?: {
      clarity: number
      confidence: number
      technical_knowledge: number
      communication: number
    }
    feedback?: string
    suggestions?: string[]
    duration_minutes: number
  }
  onRestartInterview: () => void
}

export default function FeedbackDisplay({ results, onRestartInterview }: FeedbackDisplayProps) {
  const { category_scores = {}, feedback = "No feedback provided.", suggestions = [] } = results

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

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Average"
    return "Needs Improvement"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Interview Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.overall_score)}`}>
              {results.overall_score}/100
            </div>
            <div className="text-lg text-slate-600 dark:text-slate-400 mb-4">
              Overall Performance: {getPerformanceLevel(results.overall_score)}
            </div>
            <Progress value={results.overall_score} className="max-w-md mx-auto h-3" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{results.questions.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions Answered</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{results.duration_minutes}m</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Duration</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {results.questions.length > 0 ? Math.round(results.duration_minutes / results.questions.length) : 0}m
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Avg per Question</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="answers">Answer Review</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(category_scores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{category.replace("_", " ")}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(score as number)}`}>{score as React.ReactNode}/100</span>
                        <Badge className={getScoreBg(score as number)}>{getPerformanceLevel(score as number)}</Badge>
                      </div>
                    </div>
                    <Progress value={score as number} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Overall Feedback</h3>
                <p className="text-blue-800 dark:text-blue-200">{feedback}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answers">
          <Card>
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.answers.map((answer, index) => {
                  const question = results.questions.find((q) => q.id === answer.question_id)
                  return (
                    <div key={answer.question_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <Badge
                              className={
                                question?.category === "technical"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {question?.category}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white mb-2">{question?.question}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={answer.score >= 8 ? "default" : answer.score >= 6 ? "secondary" : "destructive"}
                          >
                            {answer.score}/10
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {Math.floor(answer.time_taken / 60)}m {answer.time_taken % 60}s
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 mb-3">
                        <p className="text-sm">{answer.answer || "No answer provided"}</p>
                      </div>

                      {answer.feedback && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-slate-600 dark:text-slate-400">{answer.feedback}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{suggestion}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">💡 Next Steps</h3>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Practice the STAR method for behavioral questions</li>
                  <li>• Prepare specific examples with quantifiable results</li>
                  <li>• Research common questions for your target role</li>
                  <li>• Practice explaining technical concepts simply</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onRestartInterview} className="px-6">
          <RotateCcw className="h-4 w-4 mr-2" />
          Practice Again
        </Button>
        <Button variant="outline" className="px-6 bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" className="px-6 bg-transparent">
          <Share className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </motion.div>
  )
}