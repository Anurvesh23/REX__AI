// app/dashboard/resume-builder/components/templates/TimelineTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, MapPin, CalendarDays } from 'lucide-react';

export const TimelineTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="bg-white p-8 font-sans text-sm text-gray-800">
            <header className="mb-8 pb-4 border-b-2 border-gray-300">
                <h1 className="text-3xl font-bold text-center tracking-wide">{personalInfo.name || "Your Name"}</h1>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-600">
                    {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{personalInfo.phone}</span>}
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1"><Mail className="h-3 w-3" />{personalInfo.email}</a>}
                    {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{personalInfo.location}</span>}
                </div>
            </header>

            {experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">Experience</h2>
                    <div className="relative pl-4 border-l-2 border-gray-200">
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-6 relative">
                                <span className="absolute -left-2 top-0 h-4 w-4 bg-blue-700 rounded-full"></span>
                                <h3 className="font-bold text-base">{exp.title}</h3>
                                <p className="italic text-gray-700">{exp.company}, {exp.location}</p>
                                <p className="text-xs text-gray-600 flex items-center gap-1"><CalendarDays className="h-3 w-3" />{exp.startDate} - {exp.endDate}</p>
                                <ul className="list-disc list-inside mt-2 text-gray-700 leading-relaxed pl-4">
                                    {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {education.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">Education</h2>
                    <div className="relative pl-4 border-l-2 border-gray-200">
                        {education.map(edu => (
                            <div key={edu.id} className="mb-6 relative">
                                <span className="absolute -left-2 top-0 h-4 w-4 bg-blue-700 rounded-full"></span>
                                <h3 className="font-bold text-base">{edu.degree}</h3>
                                <p className="italic text-gray-700">{edu.school}</p>
                                <p className="text-xs text-gray-600 flex items-center gap-1"><CalendarDays className="h-3 w-3" />{edu.graduationDate}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {skills.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-700">
                        {skills.map(skill => (
                            <span key={skill.id} className="inline-block py-1 px-3 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{skill.name}</span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};