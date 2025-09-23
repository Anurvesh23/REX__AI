// app/dashboard/resume-builder/components/ResumePreview.tsx
"use client";

import { useResume } from './ResumeProvider';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

export const ResumePreview = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <Card className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto">
            <CardContent className="p-8 font-sans text-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    {personalInfo.name && <h1 className="text-3xl font-bold tracking-tight">{personalInfo.name}</h1>}
                    <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                        {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{personalInfo.phone}</a>}
                        {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{personalInfo.email}</a>}
                        {personalInfo.website && <a href={personalInfo.website} target="_blank" className="flex items-center gap-1 hover:text-primary"><Globe className="h-3 w-3" />{personalInfo.website}</a>}
                    </div>
                </div>

                {/* Experience */}
                {experience.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold uppercase tracking-wider border-b-2 border-primary pb-1 mb-3">Experience</h2>
                        <div className="space-y-4">
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold">{exp.title}</h3>
                                        <div className="text-xs font-mono">{exp.startDate} - {exp.endDate}</div>
                                    </div>
                                    <div className="flex justify-between items-baseline text-sm">
                                        <p className="italic">{exp.company}</p>
                                        <p className="text-xs text-muted-foreground">{exp.location}</p>
                                    </div>
                                    <ul className="list-disc list-inside mt-2 text-muted-foreground text-xs space-y-1">
                                        {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold uppercase tracking-wider border-b-2 border-primary pb-1 mb-3">Education</h2>
                        <div className="space-y-2">
                             {education.map(edu => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold">{edu.school}</h3>
                                        <p className="text-xs font-mono">{edu.graduationDate}</p>
                                    </div>
                                    <p className="text-sm italic">{edu.degree}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Skills */}
                {skills.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold uppercase tracking-wider border-b-2 border-primary pb-1 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => skill.name && (
                               <p key={skill.id} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">{skill.name}</p>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};