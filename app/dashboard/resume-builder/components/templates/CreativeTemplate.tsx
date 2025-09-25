// app/dashboard/resume-builder/components/templates/CreativeTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

export const CreativeTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="font-sans text-sm flex min-h-[1123px]">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-800 text-white p-8">
                 <h1 className="text-3xl font-bold tracking-tight mb-2 text-cyan-400">{personalInfo.name || "Your Name"}</h1>
                <h2 className="text-lg font-semibold text-gray-300 mb-8">Software Engineer</h2>

                <div className="space-y-4 text-xs">
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-3"><Mail className="h-4 w-4 text-cyan-400" />{personalInfo.email}</a>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-3"><Phone className="h-4 w-4 text-cyan-400" />{personalInfo.phone}</a>}
                    {personalInfo.location && <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-cyan-400" />{personalInfo.location}</div>}
                    {personalInfo.linkedin && <a href={personalInfo.linkedin} className="flex items-center gap-3"><Linkedin className="h-4 w-4 text-cyan-400" />{personalInfo.linkedin}</a>}
                    {personalInfo.github && <a href={personalInfo.github} className="flex items-center gap-3"><Github className="h-4 w-4 text-cyan-400" />{personalInfo.github}</a>}
                </div>

                {skills.length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-xl font-semibold text-cyan-400 border-b-2 border-cyan-400 pb-1 mb-4">Skills</h3>
                        <ul className="list-none space-y-2">
                            {skills.map(skill => <li key={skill.id}>{skill.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8 bg-white">
                 {experience.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-4">Experience</h3>
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-5">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{exp.title}</h4>
                                    <div className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</div>
                                </div>
                                <p className="italic text-sm text-gray-600">{exp.company}, {exp.location}</p>
                                <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
                                    {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {education.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-4">Education</h3>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{edu.school}</h4>
                                    <p className="text-xs text-gray-600">{edu.graduationDate}</p>
                                </div>
                                <p className="italic text-sm text-gray-600">{edu.degree}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};