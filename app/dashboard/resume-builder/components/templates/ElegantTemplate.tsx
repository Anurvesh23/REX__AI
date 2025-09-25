// app/dashboard/resume-builder/components/templates/ElegantTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

export const ElegantTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="bg-white p-10 font-serif text-gray-800 text-sm">
            <header className="flex justify-between items-center pb-6 border-b border-gray-300 mb-6">
                <div>
                    <h1 className="text-4xl font-light tracking-wide">{personalInfo.name || "Your Name"}</h1>
                    <p className="text-md text-gray-600 mt-1">Software Engineer</p>
                </div>
                <div className="text-right text-xs space-y-1">
                    {personalInfo.phone && <div className="flex items-center justify-end gap-1"><Phone className="h-3 w-3 text-gray-500" />{personalInfo.phone}</div>}
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center justify-end gap-1"><Mail className="h-3 w-3 text-gray-500" />{personalInfo.email}</a>}
                    {personalInfo.location && <div className="flex items-center justify-end gap-1"><MapPin className="h-3 w-3 text-gray-500" />{personalInfo.location}</div>}
                    {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-1"><Linkedin className="h-3 w-3 text-gray-500" />LinkedIn</a>}
                </div>
            </header>

            {experience.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-400 pb-1 mb-4">Experience</h2>
                    {experience.map(exp => (
                        <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-base">{exp.title}</h3>
                                <p className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <p className="italic text-gray-700">{exp.company}, {exp.location}</p>
                            <ul className="list-disc list-inside mt-2 text-gray-700 leading-relaxed">
                                {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-400 pb-1 mb-4">Education</h2>
                    {education.map(edu => (
                        <div key={edu.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-base">{edu.school}</h3>
                                <p className="text-xs text-gray-600">{edu.graduationDate}</p>
                            </div>
                            <p className="italic text-gray-700">{edu.degree}</p>
                        </div>
                    ))}
                </section>
            )}

            {skills.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-400 pb-1 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-700">
                        {skills.map(skill => (
                            <span key={skill.id} className="inline-block py-1 px-3 bg-gray-100 rounded-md text-xs">{skill.name}</span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};  