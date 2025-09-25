// app/dashboard/resume-builder/components/templates/ClassicTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

export const ClassicTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

    return (
        <div className="p-8 font-serif text-sm bg-white text-gray-800">
            <div className="text-center mb-6">
                {personalInfo.name && <h1 className="text-4xl font-bold tracking-wider mb-2">{personalInfo.name}</h1>}
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{personalInfo.phone}</a>}
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{personalInfo.email}</a>}
                    {personalInfo.website && <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5"><Globe className="h-3 w-3" />{personalInfo.website}</a>}
                    {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5"><Linkedin className="h-3 w-3" />{personalInfo.linkedin}</a>}
                    {personalInfo.github && <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5"><Github className="h-3 w-3" />{personalInfo.github}</a>}
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Summary</h2>
                    <p>{summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-4">Experience</h2>
                    {experience.map(exp => (
                        <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{exp.title}</h3>
                                <div className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</div>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <p className="italic">{exp.company}</p>
                                <p className="text-xs text-gray-600">{exp.location}</p>
                            </div>
                            <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                                {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Projects */}
            {projects.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-4">Projects</h2>
                    {projects.map(proj => (
                        <div key={proj.id} className="mb-4">
                            <h3 className="font-bold">{proj.name}</h3>
                             {proj.url && <a href={proj.url} className="text-xs text-blue-600" target="_blank" rel="noopener noreferrer">{proj.url}</a>}
                            <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                                {proj.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-4">Education</h2>
                    {education.map(edu => (
                        <div key={edu.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{edu.school}</h3>
                                <p className="text-xs text-gray-600">{edu.graduationDate}</p>
                            </div>
                             <p className="italic">{edu.degree}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span key={skill.id} className="bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{skill.name}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-4">Certifications</h2>
                    {certifications.map(cert => (
                        <div key={cert.id} className="mb-2">
                            <h3 className="font-bold">{cert.name} - <span className="italic font-normal">{cert.issuer}</span></h3>
                            <p className="text-xs text-gray-600">{cert.date}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};