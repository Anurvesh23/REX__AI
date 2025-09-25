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
    thumbnail: "/classic-template.png", // UPDATED PATH
    component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    thumbnail: "/modern-template.png", // UPDATED PATH
    component: ModernTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    thumbnail: "/creative-template.png", // UPDATED PATH
    component: CreativeTemplate,
  },
  {
    id: "professional",
    name: "Professional",
    thumbnail: "/professional-template.png", // UPDATED PATH
    component: ProfessionalTemplate,
  },
  {
    id: "monogram",
    name: "Monogram",
    thumbnail: "/monogram-professional-template.png", // UPDATED PATH
    component: MonogramTemplate,
  },
  {
    id: "header-accent",
    name: "Header Accent",
    thumbnail: "/header-accent-template.png", // UPDATED PATH
    component: HeaderAccentTemplate,
  },
  {
    id: "elegant",
    name: "Elegant",
    thumbnail: "/elegant-template.png", // UPDATED PATH
    component: ElegantTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    thumbnail: "/compact-template.png", // UPDATED PATH
    component: CompactTemplate,
  },
  {
    id: "timeline",
    name: "Timeline",
    thumbnail: "/timeline-template.png", // UPDATED PATH
    component: TimelineTemplate,
  },
];