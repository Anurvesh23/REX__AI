// app/dashboard/resume-builder/components/templates/MonogramTemplate.tsx
import { useResume } from '../ResumeProvider';

export const MonogramTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    const getInitials = (name: string) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <div className="bg-white text-gray-800 font-serif p-8">
            <header className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gray-700 text-white flex items-center justify-center rounded-full text-3xl font-bold flex-shrink-0">
                    {getInitials(personalInfo.name)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{personalInfo.name || "Your Name"}</h1>
                    <p className="text-sm text-gray-600">{personalInfo.email} | {personalInfo.phone} | {personalInfo.location}</p>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    {experience.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-3">Experience</h2>
                            {experience.map(exp => (
                                <div key={exp.id} className="mb-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold">{exp.title} at {exp.company}</h3>
                                        <p className="text-sm">{exp.startDate} - {exp.endDate}</p>
                                    </div>
                                    <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                                        {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
                <div className="col-span-1">
                    {education.length > 0 && (
                         <section className="mb-6">
                            <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-3">Education</h2>
                             {education.map(edu => (
                                 <div key={edu.id} className="mb-2">
                                    <h3 className="font-bold">{edu.degree}</h3>
                                    <p className="text-sm">{edu.school}</p>
                                    <p className="text-xs text-gray-600">{edu.graduationDate}</p>
                                </div>
                            ))}
                        </section>
                    )}
                    {skills.length > 0 && (
                         <section>
                            <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill.id} className="bg-gray-200 text-xs px-2 py-1 rounded">{skill.name}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};