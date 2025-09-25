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
    thumbnail: "/images/templates/classic-template.png", // CORRECTED PATH
    component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    thumbnail: "/images/templates/modern-template.png", // CORRECTED PATH
    component: ModernTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    thumbnail: "/images/templates/creative-template.png", // CORRECTED PATH
    component: CreativeTemplate,
  },
  {
    id: "professional",
    name: "Professional",
    thumbnail: "/images/templates/professional-template.png", // CORRECTED PATH
    component: ProfessionalTemplate,
  },
  {
    id: "monogram",
    name: "Monogram",
    thumbnail: "/images/templates/monogram-professional-template.png", // CORRECTED PATH
    component: MonogramTemplate,
  },
  {
    id: "header-accent",
    name: "Header Accent",
    thumbnail: "/images/templates/header-accent-template.png", // CORRECTED PATH
    component: HeaderAccentTemplate,
  },
  {
    id: "elegant",
    name: "Elegant",
    thumbnail: "/images/templates/elegant-template.png", // CORRECTED PATH
    component: ElegantTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    thumbnail: "/images/templates/compact-template.png", // CORRECTED PATH
    component: CompactTemplate,
  },
  {
    id: "timeline",
    name: "Timeline",
    thumbnail: "/images/templates/timeline-template.png", // CORRECTED PATH
    component: TimelineTemplate,
  },
];