// app/dashboard/resume-builder/components/templates/ClassicTemplate.tsx
import { useResume } from '../ResumeProvider';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Globe } from 'lucide-react';

export const ClassicTemplate = () => {
    const { resumeData } = useResume();
    const { personalInfo, experience, education, skills } = resumeData;

    return (
        <div className="p-8 font-serif text-sm">
            <div className="text-center mb-6">
                {personalInfo.name && <h1 className="text-4xl font-bold tracking-wider">{personalInfo.name}</h1>}
                <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground mt-2">
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1"><Phone className="h-3 w-3" />{personalInfo.phone}</a>}
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1"><Mail className="h-3 w-3" />{personalInfo.email}</a>}
                    {personalInfo.website && <a href={personalInfo.website} target="_blank" className="flex items-center gap-1"><Globe className="h-3 w-3" />{personalInfo.website}</a>}
                </div>
            </div>
            <Separator className="my-6" />
            
            {/* Other sections would be mapped here in a similar fashion... */}
        </div>
    );
};