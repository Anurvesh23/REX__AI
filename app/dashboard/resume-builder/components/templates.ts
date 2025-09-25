// app/dashboard/resume-builder/components/templates.ts
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";

export const templates = [
    {
        id: "classic",
        name: "Classic",
        thumbnail: "/images/resume-templates/classic.png",
        component: ClassicTemplate,
    },
    {
        id: "modern",
        name: "Modern",
        thumbnail: "/images/resume-templates/modern.png",
        component: ModernTemplate,
    },
    {
        id: "creative",
        name: "Creative",
        thumbnail: "/images/resume-templates/creative.png",
        component: CreativeTemplate,
    },
];