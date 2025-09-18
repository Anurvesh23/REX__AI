// app/dashboard/mock-interview/_components/interview-card.tsx
"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Clock } from "lucide-react";

interface InterviewCardProps {
    title: string;
    company: string;
    questions: number;
    duration: number;
    image: string;
    onStart: () => void;
}

export default function InterviewCard({ title, company, questions, duration, image, onStart }: InterviewCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <CardContent className="p-0">
                <div className="relative h-40 w-full">
                    <Image src={image} alt={title} layout="fill" objectFit="cover" />
                </div>
                <div className="p-4 space-y-3">
                    <Badge variant="outline">{company}</Badge>
                    <h3 className="text-lg font-semibold text-card-foreground leading-tight">{title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                            <HelpCircle className="h-4 w-4" />
                            <span>{questions} Questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{duration} Mins</span>
                        </div>
                    </div>
                     <Button className="w-full" onClick={onStart}>Start Now</Button>
                </div>
            </CardContent>
        </Card>
    )
}