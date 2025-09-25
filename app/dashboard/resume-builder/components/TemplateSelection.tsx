// app/dashboard/resume-builder/components/TemplateSelection.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { templates } from "./templates";
import { useResume } from "./ResumeProvider";

export const TemplateSelection = () => {
    const { setTemplate } = useResume();

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Choose a Template</h1>
                <p className="text-muted-foreground">Select a template to get started.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer group" onClick={() => setTemplate(template)}>
                        <CardContent className="p-4">
                            <div className="relative aspect-[1/1.414] mb-4 overflow-hidden rounded-lg">
                                <Image
                                    src={template.thumbnail}
                                    alt={template.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-center">{template.name}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};