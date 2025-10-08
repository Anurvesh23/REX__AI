"use client";

import { useState, useMemo, lazy, Suspense } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2, Download, Loader2 } from "lucide-react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumeProvider, useResume } from "./components/ResumeProvider";
import { TemplateSelection } from "./components/TemplateSelection";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Dynamically import heavy components
const ResumePreview = lazy(() => import('./components/ResumePreview').then(module => ({ default: module.ResumePreview })));
const DownloadDialog = lazy(() => import('./components/DownloadDialog').then(module => ({ default: module.DownloadDialog })));

const ResumeBuilderContent = () => {
    const { selectedTemplate } = useResume();
    if (!selectedTemplate) return <TemplateSelection />;
    return (
        <main className="grid md:grid-cols-2 gap-8 p-4 md:p-8">
            <ResumeForm />
            <Suspense fallback={<div className="sticky top-24 h-[calc(100vh-7rem)] flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                <ResumePreview />
            </Suspense>
        </main>
    );
};

const HeaderActions = () => {
    const { resumeData, download, isDownloadReady, improveResume, isImproving } = useResume();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isFormComplete = useMemo(() => {
        const { summary, experience, education, skills } = resumeData;
        return summary.trim() !== '' &&
               experience.length > 0 &&
               education.length > 0 &&
               skills.length > 0;
    }, [resumeData]);

    const handleImproveAndDownload = async () => {
        await improveResume();
        if (download) {
           download();
        }
        setIsDialogOpen(false);
    }

    return (
        <>
            <TooltipProvider>
                <Tooltip open={!isFormComplete ? undefined : false}>
                    <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                            <Button onClick={improveResume} disabled={!isFormComplete || isImproving}>
                                {isImproving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                AI Assistant
                            </Button>
                            <Button variant="outline" onClick={() => setIsDialogOpen(true)} disabled={!isFormComplete || !isDownloadReady}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </TooltipTrigger>
                    {!isFormComplete && (
                        <TooltipContent>
                            <p>Please fill all sections to enable.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
            <Suspense>
              {isDialogOpen && (
                <DownloadDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onDownload={() => {
                        if (download) download();
                        setIsDialogOpen(false);
                    }}
                    onImprove={handleImproveAndDownload}
                    isImproving={isImproving}
                />
              )}
            </Suspense>
        </>
    );
}

export default function ResumeBuilderPage() {
    return (
        <ResumeProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <header className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href="/dashboard/ai-duo">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                </Link>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">AI Resume Builder</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <HeaderActions />
                            </div>
                        </div>
                    </div>
                </header>
                <ResumeBuilderContent />
            </div>
        </ResumeProvider>
    );
}