// app/dashboard/resume-builder/components/templates.ts
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import { MonogramTemplate } from "./templates/MonogramTemplate";
import { HeaderAccentTemplate } from "./templates/HeaderAccentTemplate";
import { ElegantTemplate } from "./templates/ElegantTemplate";     
import { CompactTemplate } from "./templates/CompactTemplate";    
import { TimelineTemplate } from "./templates/TimelineTemplate";  
export const templates = [
    {
        id: "classic",
        name: "Classic",
        thumbnail: "/images/templates/classic-template.png", // Ensure you have this image
        component: ClassicTemplate,
    },
    {
        id: "modern",
        name: "Modern",
        thumbnail: "/images/templates/modern-template.png", // Ensure you have this image
        component: ModernTemplate,
    },
    {
        id: "creative",
        name: "Creative",
        thumbnail: "/images/templates/creative-template.png", // Ensure you have this image
        component: CreativeTemplate,
    },
    {
        id: "professional",
        name: "Professional",
        thumbnail: "/images/templates/professional-template.png", // Ensure you have this image
        component: ProfessionalTemplate,
    },
    {
        id: "monogram",
        name: "Monogram",
        thumbnail: "/images/templates/monogram-template.png", // Ensure you have this image
        component: MonogramTemplate,
    },
    {
        id: "header-accent",
        name: "Header Accent",
        thumbnail: "/images/templates/header-accent-template.png", // Ensure you have this image
        component: HeaderAccentTemplate,
    },
    {
        id: "elegant",
        name: "Elegant",
        thumbnail: "/images/templates/elegant-template.png", // NEW IMAGE
        component: ElegantTemplate,
    },
    {
        id: "compact",
        name: "Compact",
        thumbnail: "/images/templates/compact-template.png", // NEW IMAGE
        component: CompactTemplate,
    },
    {
        id: "timeline",
        name: "Timeline",
        thumbnail: "/images/templates/timeline-template.png", // NEW IMAGE
        component: TimelineTemplate,
    },
]; 