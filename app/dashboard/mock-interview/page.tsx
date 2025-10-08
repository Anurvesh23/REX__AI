// app/dashboard/mock-interview/page.tsx
"use client"

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InterviewCard from "./_components/interview-card";
import dynamic from 'next/dynamic';

const DeviceSetup = dynamic(() => import("./_components/device-setup"), {
    suspense: true,
    loading: () => <LoadingSpinner />,
});
const VideoInterview = dynamic(() => import("./_components/video-interview"), {
    suspense: true,
    loading: () => <LoadingSpinner />,
});

const interviews = {
    technical: [
        {
            title: "Data Structures & Algorithms",
            company: "Tech Giants",
            questions: 20,
            duration: 60,
            image: "/images/roles/software-developer.png",
        },
        {
            title: "System Design Fundamentals",
            company: "Startups",
            questions: 10,
            duration: 90,
            image: "/images/roles/cloud-architect.png",
        },
    ],
    behavioral: [
        {
            title: "Leadership & Teamwork",
            company: "All Roles",
            questions: 15,
            duration: 30,
            image: "/images/roles/hr-manager.jpg",
        }
    ],
    company_specific: [
         {
            title: "Amazon SDE Interview",
            company: "Amazon",
            questions: 25,
            duration: 60,
            image: "/images/roles/backend-developer.png",
        },
         {
            title: "Google Product Manager",
            company: "Google",
            questions: 10,
            duration: 45,
            image: "/images/roles/product-manager.jpg",
        }
    ]
};

type InterviewState = 'selection' | 'setup' | 'active';
interface InterviewDetails {
    title: string;
    company: string;
}

const LoadingSpinner = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
    </div>
);

export default function MockInterviewPage() {
    const [interviewState, setInterviewState] = useState<InterviewState>('selection');
    const [selectedInterview, setSelectedInterview] = useState<InterviewDetails | null>(null);
    const [userStream, setUserStream] = useState<MediaStream | null>(null);

    const handleStartInterview = (interview: InterviewDetails) => {
        setSelectedInterview(interview);
        setInterviewState('setup');
    };

    const handleSetupComplete = (stream: MediaStream) => {
        setUserStream(stream);
        setInterviewState('active');
    };
    
    const handleCancelSetup = () => {
        setInterviewState('selection');
        setSelectedInterview(null);
    }

    const handleEndInterview = () => {
        userStream?.getTracks().forEach(track => track.stop());
        setUserStream(null);
        setInterviewState('selection');
        setSelectedInterview(null);
    };

    if (interviewState === 'setup' && selectedInterview) {
        return (
            <Suspense fallback={<LoadingSpinner />}>
                <DeviceSetup 
                    interviewTitle={selectedInterview.title} 
                    onSetupComplete={handleSetupComplete}
                    onCancel={handleCancelSetup}
                />
            </Suspense>
        );
    }

    if (interviewState === 'active' && selectedInterview) {
        return (
            <Suspense fallback={<LoadingSpinner />}>
                <VideoInterview 
                    interviewDetails={selectedInterview} 
                    userStream={userStream} 
                    onEndInterview={handleEndInterview} 
                />
            </Suspense>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* CORRECTED: Wrapped in a flex container for proper alignment */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        </Link>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">Mock Interviews</span>
                    </div>
                 </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Practice and Prepare: Get Hired by Top Companies
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Our AI-powered mock interviews are designed to help you ace interviews at your dream company.
                    </p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search for interviews (e.g., 'Amazon', 'System Design')" className="pl-10 h-12" />
                    </div>
                    <Button variant="outline" className="h-12">
                        <SlidersHorizontal className="h-5 w-5 mr-2" />
                        Filters
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto mx-auto">
                        <TabsTrigger value="all">All Interviews</TabsTrigger>
                        <TabsTrigger value="technical">Technical</TabsTrigger>
                        <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                        <TabsTrigger value="company_specific">Company Specific</TabsTrigger>
                        <TabsTrigger value="featured">Featured</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(interviews).flat().map((interview, index) => (
                                <InterviewCard key={index} {...interview} onStart={() => handleStartInterview(interview)} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="technical" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {interviews.technical.map((interview, index) => (
                                <InterviewCard key={index} {...interview} onStart={() => handleStartInterview(interview)} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="behavioral" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {interviews.behavioral.map((interview, index) => (
                                <InterviewCard key={index} {...interview} onStart={() => handleStartInterview(interview)} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="company_specific" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {interviews.company_specific.map((interview, index) => (
                                <InterviewCard key={index} {...interview} onStart={() => handleStartInterview(interview)} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}