"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

// UI Components (assuming they are from shadcn/ui or similar)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

// Icons
import {
  Brain,
  FileText,
  MessageSquare,
  Search,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Menu,
  X,
  GraduationCap,
  Star,
} from "lucide-react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Effect to handle navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Data for feature modules
  const modules = [
    {
      id: "ai-duo",
      title: "AI DUO",
      description: "Build a new resume with AI or get an expert review of your existing one.",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      features: ["AI Resume Builder", "AI Resume Reviewer", "ATS-Friendly Templates"],
      href: "/dashboard/ai-duo",
    },
    {
      id: "mock-interview",
      title: "Mock Interview",
      description: "Practice with company-specific and role-specific interview simulations.",
      icon: GraduationCap,
      color: "from-orange-500 to-red-500",
      features: ["Company-Specific Questions", "Behavioral & Technical Rounds", "Real-world Scenarios"],
      href: "/dashboard/mock-interview",
    },
    {
      id: "mock-test",
      title: "Mock Test",
      description: "AI-powered skill tests with MCQs, feedback, and scores.",
      icon: MessageSquare,
      color: "from-green-500 to-teal-500",
      features: ["AI-Generated MCQs", "Real-time Feedback", "Performance Scoring"],
      href: "/dashboard/mock-test",
    },
    {
      id: "job-search",
      title: "Job Search",
      description: "Curated job suggestions and save jobs with personalized AI filters",
      icon: Search,
      color: "from-purple-500 to-indigo-500",
      features: ["Personalized Matches", "Application Tracking", "Job Alerts"],
      href: "/dashboard/job-search",
    },
  ]

  // Data for "How It Works" steps
  const steps = [
    { step: 1, title: "Sign Up", description: "Create your account in seconds" },
    { step: 2, title: "Choose a Tool", description: "Select Resume, Interview, or Test" },
    { step: 3, title: "Upload & Practice", description: "Upload a resume or start a session" },
    { step: 4, title: "Get Insights", description: "Receive personalized recommendations" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                AI-Powered Career Tools
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Upgrade Your Resume with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI Precision
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Harness the power of AI to improve your resume and land your dream job faster. Get personalized insights,
                practice interviews, and discover perfect job matches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">10K+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Resumes Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">95%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">4.9★</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">User Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
                <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <span className="text-lg font-semibold">AI Analysis Complete</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Resume Score</span>
                      <span className="text-2xl font-bold text-green-600">87/100</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[87%]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ATS Compatible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Keywords Optimized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">3 Improvements Suggested</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Powerful AI Features</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to accelerate your job search and land your dream role.
            </p>
          </motion.div>

          {/* Module Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col">
                  <CardHeader className="pb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <module.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900 dark:text-white">{module.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex-grow flex flex-col justify-between">
                    <ul className="space-y-2 mb-8">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={module.href}>
                      <Button className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </motion.div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Dashed Line Connector for Desktop */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 w-full h-px">
              <svg width="100%" height="2">
                <line
                  x1="0"
                  y1="1"
                  x2="100%"
                  y2="1"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  className="stroke-slate-300 dark:stroke-slate-600"
                />
              </svg>
            </div>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative bg-slate-50 dark:bg-slate-900 p-4 rounded-lg"
              >
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of job seekers who have already upgraded their careers with Rex--AI
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-slate-200">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Rex--AI</span>
              </div>
              <p className="text-slate-400">Empowering job seekers with AI-powered career tools.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                {modules.map(module => (
                  <li key={module.id}>
                    <Link href={module.href} className="hover:text-white transition-colors">
                      {module.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} Rex--AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}