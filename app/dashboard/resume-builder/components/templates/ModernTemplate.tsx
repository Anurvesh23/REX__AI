// app/dashboard/resume-builder/components/templates/ModernTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

export const ModernTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="p-8 font-sans text-sm bg-white text-gray-800 flex">
            {/* Left Column (Sidebar) */}
            <div className="w-1/3 pr-8 border-r border-gray-300">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{personalInfo.name || "Your Name"}</h1>
                <h2 className="text-lg font-semibold text-blue-600 mb-6">Software Engineer</h2>

                <div className="space-y-3 text-xs">
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2"><Mail className="h-4 w-4" />{personalInfo.email}</a>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-2"><Phone className="h-4 w-4" />{personalInfo.phone}</a>}
                    {personalInfo.location && <div className="flex items-center gap-2"><Globe className="h-4 w-4" />{personalInfo.location}</div>}
                    {personalInfo.linkedin && <a href={personalInfo.linkedin} className="flex items-center gap-2"><Linkedin className="h-4 w-4" />{personalInfo.linkedin}</a>}
                    {personalInfo.github && <a href={personalInfo.github} className="flex items-center gap-2"><Github className="h-4 w-4" />{personalInfo.github}</a>}
                </div>

                {skills.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-3">Skills</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {skills.map(skill => <li key={skill.id}>{skill.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Column (Main Content) */}
            <div className="w-2/3 pl-8">
                {experience.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">Experience</h3>
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{exp.title}</h4>
                                    <div className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</div>
                                </div>
                                <p className="italic text-sm">{exp.company}, {exp.location}</p>
                                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                                    {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {education.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">Education</h3>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{edu.school}</h4>
                                    <p className="text-xs text-gray-600">{edu.graduationDate}</p>
                                </div>
                                <p className="italic text-sm">{edu.degree}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};