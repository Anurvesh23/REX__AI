"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  Download,
  Share,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { interviewAPI } from "@/lib/api"

interface FeedbackDisplayProps {
  results: {
    questions: any[]
    answers: any[]
    overall_score: number
    category_scores?: {
      [key: string]: number;
    }
    feedback?: string
    suggestions?: string[]
    duration_minutes: number
    job_role: string;
    difficulty: string;
    total_questions: number;
    correct_answers: number;
  }
  onRestartInterview: () => void
}

export default function FeedbackDisplay({ results, onRestartInterview }: FeedbackDisplayProps) {
  const { category_scores = {}, feedback = "No feedback provided.", suggestions = [] } = results
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Average"
    return "Needs Improvement"
  }

  const handleDownloadReport = async () => {
    toast({ title: "Generating PDF Report...", description: "Please wait." });
    try {
        const reportData = {
            ...results,
            job_role: results.job_role || "Selected Role",
            difficulty: results.difficulty || "Medium",
        };
        const blob = await interviewAPI.generateTestReport(reportData);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${results.job_role}_Mock_Test_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to download report:", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not generate your report. Please try again.",
        });
    }
  };

  const handleShareResults = async () => {
    const shareData = {
      title: `My Mock Test Result for ${results.job_role}`,
      text: `I scored ${results.overall_score}/100 on the ${results.difficulty} ${results.job_role} mock test on Rex--AI! Check out the platform to practice for your interviews.`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} \n${shareData.url}`);
        toast({ title: "Copied to Clipboard!", description: "Results copied to your clipboard." });
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to Copy", description: "Could not copy results to clipboard." });
      }
    }
  };

  const totalTimeTakenSeconds = results.answers.reduce((acc, a) => acc + a.time_taken, 0);
  const averageTimePerQuestion = results.answers.length > 0 ? Math.round(totalTimeTakenSeconds / results.answers.length) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Mock Test Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            <div className="relative w-40 h-40">
               <Image 
                src={results.overall_score >= 70 ? "/images/performance-good.png" : "/images/performance-bad.png"}
                alt="Performance Gauge"
                width={160}
                height={160}
               />
            </div>
            <div className="text-center md:text-left">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.overall_score)}`}>
                {results.overall_score}/100
              </div>
              <div className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                Overall Performance: {getPerformanceLevel(results.overall_score)}
              </div>
              <Progress value={results.overall_score} className="max-w-md mx-auto md:mx-0 h-3" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{results.answers.length}/{results.total_questions}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions Answered</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{results.duration_minutes}m {totalTimeTakenSeconds % 60}s</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Duration</div>
            </div>
             <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{averageTimePerQuestion}s</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Avg Time / Question</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="answers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="answers">Answer Review</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
        </TabsList>

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
                    <div key={answer.question_id} className="border rounded-lg p-4 space-y-3">
                      <div>
                          <p className="text-sm text-slate-500 mb-1">Question {index + 1}</p>
                          <p className="font-medium text-slate-900 dark:text-white">{question?.question}</p>
                      </div>
                      <div className="space-y-2">
                          {answer.is_correct ? (
                            <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Your Answer (Correct)</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{answer.selected_answer}</p>
                                </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">Your Answer</p>
                                      <p className="text-sm text-slate-700 dark:text-slate-300">{answer.selected_answer || "You skipped this question."}</p>
                                  </div>
                              </div>
                               <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                      <p className="text-sm font-semibold text-green-800 dark:text-green-200">Correct Answer</p>
                                      <p className="text-sm text-slate-700 dark:text-slate-300">{answer.correct_answer}</p>
                                  </div>
                              </div>
                            </>
                          )}
                      </div>
                      {answer.feedback && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">AI Feedback</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{answer.feedback}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
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
                    <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 justify-center">
        <Button onClick={onRestartInterview} className="px-6">
          <RotateCcw className="h-4 w-4 mr-2" />
          Practice Again
        </Button>
        <Button variant="outline" className="px-6 bg-transparent" onClick={handleDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" className="px-6 bg-transparent" onClick={handleShareResults}>
          <Share className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </motion.div>
  )
}