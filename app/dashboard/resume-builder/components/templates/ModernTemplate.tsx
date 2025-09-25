// app/dashboard/resume-builder/components/templates/ModernTemplate.tsx
import { useResume } from '../ResumeProvider';

export const ModernTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo } = resumeData;

    return (
        <div className="p-8 font-sans">
            <h1 className="text-3xl font-bold text-center">{personalInfo.name || "Your Name"}</h1>
            <p className="text-center text-muted-foreground">{personalInfo.email || "your.email@example.com"}</p>
            {/* Add Modern Template Layout Here */}
        </div>
    );
};