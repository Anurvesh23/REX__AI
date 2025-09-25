// app/dashboard/resume-builder/components/templates/ProfessionalTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

export const ProfessionalTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

    return (
        <div className="bg-white text-gray-800 font-sans p-8 flex text-xs">
            {/* Left Column */}
            <div className="w-1/3 pr-8 border-r border-gray-200">
                <h1 className="text-2xl font-bold mb-1">{personalInfo.name || "Your Name"}</h1>
                <p className="text-blue-600 font-semibold mb-6">Software Engineer</p>

                <div className="space-y-3 mb-6">
                    <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1">Contact</h2>
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 mt-2"><Mail className="h-3 w-3" />{personalInfo.email}</a>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-2"><Phone className="h-3 w-3" />{personalInfo.phone}</a>}
                    {personalInfo.location && <div className="flex items-center gap-2"><Globe className="h-3 w-3" />{personalInfo.location}</div>}
                    {personalInfo.linkedin && <a href={personalInfo.linkedin} className="flex items-center gap-2"><Linkedin className="h-3 w-3" />LinkedIn</a>}
                    {personalInfo.github && <a href={personalInfo.github} className="flex items-center gap-2"><Github className="h-3 w-3" />GitHub</a>}
                </div>

                 {skills.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1">Skills</h2>
                        <ul className="list-disc list-inside pl-2 mt-2 space-y-1">
                            {skills.map(skill => <li key={skill.id}>{skill.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/3 pl-8">
                <div className="mb-6">
                    <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1 mb-2">Summary</h2>
                    <p>{summary}</p>
                </div>

                {experience.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1 mb-2">Experience</h2>
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-sm">{exp.title}</h3>
                                    <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <p className="italic text-gray-700">{exp.company}, {exp.location}</p>
                                <ul className="list-disc list-inside mt-1 text-gray-600">
                                    {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {projects.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1 mb-2">Projects</h2>
                        {projects.map(proj => (
                            <div key={proj.id} className="mb-3">
                                <h3 className="font-bold text-sm">{proj.name}</h3>
                                <ul className="list-disc list-inside mt-1 text-gray-600">
                                    {proj.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {education.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1 mb-2">Education</h2>
                        {education.map(edu => (
                             <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-sm">{edu.school}</h3>
                                    <p className="text-gray-600">{edu.graduationDate}</p>
                                </div>
                                <p className="italic text-gray-700">{edu.degree}</p>
                            </div>
                        ))}
                    </div>
                )}

                 {certifications.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1 mb-2">Certifications</h2>
                        {certifications.map(cert => (
                             <div key={cert.id} className="mb-2">
                                <h3 className="font-bold text-sm">{cert.name}</h3>
                                <p className="italic text-gray-700">{cert.issuer} - {cert.date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};