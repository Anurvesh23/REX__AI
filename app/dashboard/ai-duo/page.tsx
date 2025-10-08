"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Edit, Star, CheckCircle } from "lucide-react";

export default function AiDuoPage() {
  const tools = [
    {
      title: "AI Resume Builder",
      description: "Build a professional, ATS-friendly resume from scratch in minutes with AI-powered suggestions.",
      icon: Edit,
      href: "/dashboard/resume-builder",
      features: [
        "Build in 10 minutes",
        "AI-powered suggestions",
        "ATS-friendly templates",
      ],
      cta: "Build My Resume",
    },
    {
      title: "AI Resume Reviewer",
      description: "Get an instant, detailed review of your existing resume with an AI score and improvement tips.",
      icon: Star,
      href: "/dashboard/resume-analyzer",
      features: [
        "Get your AI Score",
        "Detailed feedback",
        "Improve your chances",
      ],
      cta: "Review My Resume",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16">
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b fixed top-16 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    </Link>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">AI DUO</span>
                </div>
            </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Your AI-Powered Resume Toolkit
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                    Whether you're starting from scratch or optimizing an existing resume, our AI tools are here to help you stand out.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                    >
                        <Card className="h-full flex flex-col">
                            <CardHeader className="items-center text-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                     <tool.icon className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">{tool.title}</CardTitle>
                                <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow justify-between">
                                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                                    {tool.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href={tool.href}>
                                    <Button className="w-full">{tool.cta}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </main>
    </div>
  );
}