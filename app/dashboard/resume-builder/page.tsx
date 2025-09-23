// app/dashboard/resume-builder/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2 } from "lucide-react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumePreview } from "./components/ResumePreview";
import { ResumeProvider } from "./components/ResumeProvider";

export default function ResumeBuilderPage() {
    return (
        <ResumeProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href="/dashboard/ai-duo">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to AI DUO
                                    </Button>
                                </Link>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">AI Resume Builder</span>
                            </div>
                            <Button>
                                <Wand2 className="h-4 w-4 mr-2" />
                                AI Assistant
                            </Button>
                        </div>
                    </div>
                </div>
                <main className="grid md:grid-cols-2 gap-8 p-8">
                    <ResumeForm />
                    <ResumePreview />
                </main>
            </div>
        </ResumeProvider>
    );
}