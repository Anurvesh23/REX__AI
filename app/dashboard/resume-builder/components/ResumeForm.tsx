// app/dashboard/resume-builder/components/ResumeForm.tsx
"use client";

import { useState } from 'react';
import { useResume } from './ResumeProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, PlusCircle, Wand2, Loader2 } from "lucide-react";
import type { Experience, Education, Skill } from './ResumeProvider';
import { resumeBuilderAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AiAssistantProps {
    section: 'experience';
    item: Experience;
    onUpdate: (newDescription: string) => void;
}

const AiAssistantButton = ({ section, item, onUpdate }: AiAssistantProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleRewrite = async () => {
        if (!item.description) {
            toast({
                variant: "destructive",
                title: "Cannot Rewrite",
                description: "Please enter a description to rewrite.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await resumeBuilderAPI.rewriteDescription(item.title, item.description);
            onUpdate(result.rewritten_description);
            toast({
                title: "Success!",
                description: "Your experience has been rewritten by AI.",
            });
        } catch (error) {
            console.error("Failed to rewrite description:", error);
            toast({
                variant: "destructive",
                title: "Rewrite Failed",
                description: "Could not connect to the AI assistant. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleRewrite} disabled={isLoading} className="gap-2">
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Wand2 className="h-4 w-4" />
            )}
            AI Rewrite
        </Button>
    );
};


export const ResumeForm = () => {
    const { resumeData, updateField, addListItem, removeListItem, updateListItem } = useResume();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['personal', 'experience', 'education', 'skills']} className="w-full">
                    {/* Personal Information */}
                    <AccordionItem value="personal">
                        <AccordionTrigger>Personal Information</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={resumeData.personalInfo.name} onChange={(e) => updateField('personalInfo', null, 'name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={resumeData.personalInfo.email} onChange={(e) => updateField('personalInfo', null, 'email', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={resumeData.personalInfo.phone} onChange={(e) => updateField('personalInfo', null, 'phone', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={resumeData.personalInfo.location} onChange={(e) => updateField('personalInfo', null, 'location', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Website/Portfolio</Label>
                                <Input value={resumeData.personalInfo.website} onChange={(e) => updateField('personalInfo', null, 'website', e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    
                    {/* Professional Experience */}
                    <AccordionItem value="experience">
                        <AccordionTrigger>Professional Experience</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            {resumeData.experience.map((exp, index) => (
                                <div key={exp.id} className="p-4 border rounded-lg space-y-3 relative">
                                    <Button variant="outline" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeListItem('experience', exp.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Job Title</Label>
                                            <Input value={exp.title} onChange={(e) => updateListItem('experience', exp.id, 'title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company</Label>
                                            <Input value={exp.company} onChange={(e) => updateListItem('experience', exp.id, 'company', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label>Location</Label>
                                            <Input value={exp.location} onChange={(e) => updateListItem('experience', exp.id, 'location', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input value={exp.startDate} onChange={(e) => updateListItem('experience', exp.id, 'startDate', e.target.value)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input value={exp.endDate} onChange={(e) => updateListItem('experience', exp.id, 'endDate', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={(e) => updateListItem('experience', exp.id, 'description', e.target.value)} />
                                         <AiAssistantButton 
                                            section="experience" 
                                            item={exp} 
                                            onUpdate={(newDesc) => updateListItem('experience', exp.id, 'description', newDesc)} 
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => addListItem('experience')} className="w-full gap-2">
                                <PlusCircle className="h-4 w-4" /> Add Experience
                            </Button>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Education */}
                    <AccordionItem value="education">
                        <AccordionTrigger>Education</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            {resumeData.education.map(edu => (
                                 <div key={edu.id} className="p-4 border rounded-lg space-y-3 relative">
                                    <Button variant="outline" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeListItem('education', edu.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>School/University</Label>
                                            <Input value={edu.school} onChange={(e) => updateListItem('education', edu.id, 'school', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input value={edu.location} onChange={(e) => updateListItem('education', edu.id, 'location', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Degree</Label>
                                            <Input value={edu.degree} onChange={(e) => updateListItem('education', edu.id, 'degree', e.target.value)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Graduation Date</Label>
                                            <Input value={edu.graduationDate} onChange={(e) => updateListItem('education', edu.id, 'graduationDate', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => addListItem('education')} className="w-full gap-2">
                                <PlusCircle className="h-4 w-4" /> Add Education
                            </Button>
                        </AccordionContent>
                    </AccordionItem>

                     {/* Skills */}
                     <AccordionItem value="skills">
                        <AccordionTrigger>Skills</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                             {resumeData.skills.map(skill => (
                                 <div key={skill.id} className="flex items-center gap-2">
                                     <Input value={skill.name} onChange={(e) => updateListItem('skills', skill.id, 'name', e.target.value)} placeholder="e.g., Python" />
                                     <Button variant="ghost" size="icon" onClick={() => removeListItem('skills', skill.id)}>
                                         <Trash2 className="h-4 w-4" />
                                     </Button>
                                 </div>
                             ))}
                            <Button variant="outline" onClick={() => addListItem('skills')} className="w-full gap-2">
                                <PlusCircle className="h-4 w-4" /> Add Skill
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};