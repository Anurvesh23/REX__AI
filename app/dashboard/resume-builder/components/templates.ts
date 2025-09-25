// app/dashboard/resume-builder/components/templates.ts
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate"; // Added
import { MonogramTemplate } from "./templates/MonogramTemplate";     // Added
import { HeaderAccentTemplate } from "./templates/HeaderAccentTemplate"; // Added

export const templates = [
    {
        id: "classic",
        name: "Classic",
        thumbnail: "/images/roles/content-writer.jpg", // Using placeholder thumbnail
        component: ClassicTemplate,
    },
    {
        id: "modern",
        name: "Modern",
        thumbnail: "/images/roles/business-analyst.jpg", // Using placeholder thumbnail
        component: ModernTemplate,
    },
    {
        id: "creative",
        name: "Creative",
        thumbnail: "/images/roles/graphic-designer.jpg", // Using placeholder thumbnail
        component: CreativeTemplate,
    },
    // --- New Templates Added Below ---
    {
        id: "professional",
        name: "Professional",
        thumbnail: "/images/roles/software-developer.png", // Using placeholder thumbnail
        component: ProfessionalTemplate,
    },
    {
        id: "monogram",
        name: "Monogram",
        thumbnail: "/images/roles/product-manager.jpg", // Using placeholder thumbnail
        component: MonogramTemplate,
    },
    {
        id: "header-accent",
        name: "Header Accent",
        thumbnail: "/images/roles/hr-manager.jpg", // Using placeholder thumbnail
        component: HeaderAccentTemplate,
    },
];