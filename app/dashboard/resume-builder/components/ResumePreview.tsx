"use client";

import { useRef } from 'react';
import { useResume } from './ResumeProvider';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { resumeAPI } from '@/lib/api';

export const ResumePreview = () => {
    const { selectedTemplate } = useResume();
    const { toast } = useToast();
    const resumePreviewRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!resumePreviewRef.current) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not capture resume content for download.",
            });
            return;
        }

        toast({ title: "Generating PDF..." });

        try {
            // Extract the inner HTML of the preview component
            const resumeHtmlContent = resumePreviewRef.current.innerHTML;
            
            // Backend expects a plain text string; for simplicity, we'll send the HTML
            // A more advanced implementation would convert HTML to a text format or handle it on the backend.
            const blob = await resumeAPI.generateAiResumePdf(resumeHtmlContent);

            // Create a download link and trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
             toast({
                title: "Success!",
                description: "Your resume has been downloaded.",
            });

        } catch (error) {
            console.error("Failed to download resume:", error);
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: "Could not generate the PDF. Please try again.",
            });
        }
    };

    if (!selectedTemplate) return null;

    const TemplateComponent = selectedTemplate.component;

    return (
        <div className="sticky top-24">
            <Card className="h-[calc(100vh-10rem)] overflow-y-auto">
                <CardContent className="p-0" ref={resumePreviewRef}>
                    <TemplateComponent />
                </CardContent>
            </Card>
            <div className="mt-4 text-center">
                 <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                </Button>
            </div>
        </div>
    );
};