// app/dashboard/resume-builder/components/templates/CompactTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, MapPin } from 'lucide-react';

export const CompactTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="bg-white p-6 font-sans text-xs text-gray-800">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-blue-700">{personalInfo.name || "Your Name"}</h1>
                <p className="text-sm text-gray-600 mb-2">Software Engineer</p>
                <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1 text-gray-700">
                    {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{personalInfo.phone}</span>}
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1"><Mail className="h-3 w-3" />{personalInfo.email}</a>}
                    {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{personalInfo.location}</span>}
                </div>
            </header>

            <div className="grid grid-cols-4 gap-x-6">
                {/* Main Content Area */}
                <div className="col-span-3">
                    {experience.length > 0 && (
                        <section className="mb-5">
                            <h2 className="text-md font-bold text-blue-700 border-b border-gray-300 pb-1 mb-3">Experience</h2>
                            {experience.map(exp => (
                                <div key={exp.id} className="mb-3">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold">{exp.title}</h3>
                                        <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
                                    </div>
                                    <p className="italic text-gray-700">{exp.company}, {exp.location}</p>
                                    <ul className="list-disc list-inside ml-4 mt-1 text-gray-700 leading-tight">
                                        {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="col-span-1">
                    {education.length > 0 && (
                        <section className="mb-5">
                            <h2 className="text-md font-bold text-blue-700 border-b border-gray-300 pb-1 mb-3">Education</h2>
                            {education.map(edu => (
                                <div key={edu.id} className="mb-2">
                                    <h3 className="font-semibold">{edu.school}</h3>
                                    <p className="text-gray-700">{edu.degree}</p>
                                    <p className="text-gray-600">{edu.graduationDate}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {skills.length > 0 && (
                        <section>
                            <h2 className="text-md font-bold text-blue-700 border-b border-gray-300 pb-1 mb-3">Skills</h2>
                            <ul className="list-none space-y-1">
                                {skills.map(skill => <li key={skill.id} className="text-gray-700">{skill.name}</li>)}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};