"use client";

import { useResume } from './ResumeProvider';
import { Card, CardContent } from "@/components/ui/card";

export const ResumePreview = () => {
    const { selectedTemplate } = useResume();

    if (!selectedTemplate) return null;

    const TemplateComponent = selectedTemplate.component;

    return (
        <Card className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto">
            <CardContent className="p-0">
                <TemplateComponent />
            </CardContent>
        </Card>
    );
};