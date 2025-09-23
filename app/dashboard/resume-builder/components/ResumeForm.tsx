"use client";

import { useResume } from './ResumeProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ResumeData } from './ResumeProvider';

export const ResumeForm = () => {
    const context = useResume();

    if (!context) {
        // You can render a loading state or return null
        return <div>Loading...</div>;
    }

    const { resumeData, updateResume } = context;

    const handleChange = (section: keyof ResumeData, field: string, value: string) => {
        const updatedSection = { ...resumeData[section], [field]: value };
        updateResume(section, updatedSection);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={resumeData.personalInfo.name}
                                onChange={(e) => handleChange('personalInfo', 'name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={resumeData.personalInfo.email}
                                onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Other sections (Experience, Education, Skills) would go here */}

            </CardContent>
        </Card>
    );
};