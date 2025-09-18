"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InterviewCard from "./_components/interview-card";

// In a real app, this data would come from a database
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
        {
            title: "Frontend Development",
            company: "SaaS Companies",
            questions: 15,
            duration: 45,
            image: "/images/roles/frontend-developer.png",
        }
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

export default function MockInterviewPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
       <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

       {/* Main Content */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Practice and Prepare: Get Hired by Top Companies
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Our AI-powered mock interviews are designed to help you ace interviews at your dream company.
                </p>
            </div>

            {/* Search and Filters */}
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
                            <InterviewCard key={index} {...interview} />
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="technical" className="mt-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.technical.map((interview, index) => (
                            <InterviewCard key={index} {...interview} />
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="behavioral" className="mt-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.behavioral.map((interview, index) => (
                            <InterviewCard key={index} {...interview} />
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="company_specific" className="mt-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.company_specific.map((interview, index) => (
                            <InterviewCard key={index} {...interview} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
       </div>
    </div>
  );
}
