"use client";

import { useRef, useCallback, useEffect } from 'react';
import { useResume } from './ResumeProvider';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { resumeAPI } from '@/lib/api';
import { useAuth } from "@clerk/nextjs";

export const ResumePreview = () => {
    const { selectedTemplate, registerDownload } = useResume();
    const { toast } = useToast();
    const resumePreviewRef = useRef<HTMLDivElement>(null);
    const { getToken } = useAuth();
    // Using useCallback to ensure the function reference is stable
    const handleDownload = useCallback(async () => {
        if (!resumePreviewRef.current) {
            toast({ variant: "destructive", title: "Error", description: "Could not find resume content." });
            return;
        }
        toast({ title: "Generating PDF..." });

        try {
            const resumeHtmlContent = resumePreviewRef.current.innerHTML;
            const blob = await resumeAPI.generateAiResumePdf(getToken, resumeHtmlContent);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            toast({ title: "Success!", description: "Your resume has been downloaded." });
        } catch (error) {
            console.error("Failed to download resume:", error);
            toast({ variant: "destructive", title: "Download Failed", description: "Could not generate the PDF." });
        }
    }, [toast]); // Dependency array for useCallback

    // Register the download function with the provider
    useEffect(() => {
        registerDownload(handleDownload);
        // Cleanup on unmount
        return () => registerDownload(null);
    }, [registerDownload, handleDownload]);

    if (!selectedTemplate) return null;

    const TemplateComponent = selectedTemplate.component;

    return (
        <Card className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto">
            {/* The ref is attached here to capture the content */}
            <CardContent className="p-0" ref={resumePreviewRef}>
                <TemplateComponent />
            </CardContent>
        </Card>
    );
};