"use client";

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2, Download, Loader2 } from "lucide-react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumePreview } from "./components/ResumePreview";
import { ResumeProvider, useResume } from "./components/ResumeProvider";
import { TemplateSelection } from "./components/TemplateSelection";
import { DownloadDialog } from './components/DownloadDialog';
import { useToast } from '@/components/ui/use-toast';

const ResumeBuilderContent = () => {
    const { selectedTemplate } = useResume();
    if (!selectedTemplate) return <TemplateSelection />;
    return (
        <main className="grid md:grid-cols-2 gap-8 p-8">
            <ResumeForm />
            <ResumePreview />
        </main>
    );
};

// Component for header buttons to access context
const HeaderActions = () => {
    const { download, isDownloadReady, improveResume, isImproving } = useResume();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleImproveAndDownload = async () => {
        await improveResume();
        setIsDialogOpen(false);
        // Automatically trigger download after improving
        if (download) {
           download();
        }
    }

    return (
        <>
            <Button onClick={improveResume} disabled={isImproving}>
                {isImproving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                AI Assistant
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)} disabled={!isDownloadReady}>
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
            </Button>
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
        </>
    );
}

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
                            <div className="flex items-center space-x-2">
                                <HeaderActions />
                            </div>
                        </div>
                    </div>
                </div>
                <ResumeBuilderContent />
            </div>
        </ResumeProvider>
    );
}