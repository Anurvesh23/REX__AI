"use client";

import { useResume } from './ResumeProvider';
import { Card, CardContent } from "@/components/ui/card";

export const ResumePreview = () => {
    const context = useResume();

    if (!context) {
        // You can render a loading state or return null
        return <div>Loading...</div>;
    }

    const { resumeData } = context;

    return (
        <Card className="sticky top-24">
            <CardContent className="p-8">
                <h1 className="text-3xl font-bold">{resumeData.personalInfo.name}</h1>
                <p className="text-muted-foreground">{resumeData.personalInfo.email}</p>
                {/* Display other resume sections */}
            </CardContent>
        </Card>
    );
};