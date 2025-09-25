// app/dashboard/resume-builder/components/templates/CreativeTemplate.tsx
import { useResume } from '../ResumeProvider';

export const CreativeTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo } = resumeData;

    return (
        <div className="p-8 font-serif">
            <h1 className="text-3xl font-bold text-center text-primary">{personalInfo.name || "Your Name"}</h1>
            <p className="text-center text-muted-foreground">{personalInfo.email || "your.email@example.com"}</p>
            {/* Add Creative Template Layout Here */}
        </div>
    );
};