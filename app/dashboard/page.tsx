"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Search, ArrowRight, Brain, TrendingUp, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function ModuleSelector() {
  const { user } = useAuth()

  const modules = [
    {
      id: "resume-analyzer",
      title: "Resume Analyzer",
      description: "Get resume score, keyword insights, formatting suggestions",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      features: ["ATS Compatibility Check", "Keyword Optimization", "Score Analysis", "Format Suggestions"],
      href: "/dashboard/resume-analyzer",
    },
    {
      id: "mock-test",
      title: "Mock Test",
      description: "AI-powered mock test simulation with feedback and scores",
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      features: ["AI-Generated Questions", "Real-time Feedback", "Performance Scoring", "Improvement Tips"],
      href: "/dashboard/mock-test",
    },
    {
      id: "job-search",
      title: "Job Search",
      description: "Curated job suggestions and save jobs with personalized AI filters",
      icon: Search,
      color: "from-purple-500 to-purple-600",
      features: ["Personalized Matches", "Application Tracking", "Job Alerts", "Company Insights"],
      href: "/dashboard/job-search",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Rex--AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Welcome back, <span className="font-medium">{user?.user_metadata.full_name || user?.email}</span>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Choose Your AI Career Tool</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Select the module that best fits your current career needs. Each tool is powered by advanced AI to give you
            personalized insights.
          </p>
        </motion.div>

        {/* Module Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <module.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900 dark:text-white">{module.title}</CardTitle>
                  <CardDescription className="text-base">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={module.href}>
                    <Button className="w-full group-hover:bg-slate-900 transition-colors">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">87%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Score Improvement</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">10K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Resumes Analyzed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">95%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Interview Success Rate</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}