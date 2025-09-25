
// app/dashboard/resume-builder/components/templates/HeaderAccentTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Mail, Phone, MapPin } from 'lucide-react';

export const HeaderAccentTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="bg-white text-gray-800 font-sans">
            <header className="bg-blue-800 text-white p-8 text-center">
                <h1 className="text-4xl font-bold tracking-wider">{personalInfo.name || "Your Name"}</h1>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{personalInfo.email}</a>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{personalInfo.phone}</a>}
                    {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{personalInfo.location}</span>}
                </div>
            </header>

            <main className="p-8">
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Summary</h2>
                    <p className="text-sm">Highly motivated Software Engineer with experience in building and maintaining web applications. Seeking to leverage my skills in a challenging role to contribute to a dynamic team.</p>
                </section>
                
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Skills</h2>
                    <p className="text-sm">
                        {skills.map(s => s.name).join(' • ')}
                    </p>
                </section>
                
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Experience</h2>
                     {experience.map(exp => (
                        <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{exp.title}</h3>
                                <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <p className="italic">{exp.company}, {exp.location}</p>
                            <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                                {exp.description.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
                
                <section>
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Education</h2>
                     {education.map(edu => (
                         <div key={edu.id} className="mb-2">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{edu.school}</h3>
                                <p className="text-sm text-gray-600">{edu.graduationDate}</p>
                            </div>
                            <p className="italic">{edu.degree}</p>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};