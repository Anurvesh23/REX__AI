"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your resume data
interface ResumeData {
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
        website: string;
    };
    experience: any[]; // Define more specific types as needed
    education: any[];
    skills: any[];
}

// Define the type for your context
interface ResumeContextType {
    resumeData: ResumeData;
    updateResume: (section: keyof ResumeData, data: any) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export const useResume = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resumeData, setResumeData] = useState<ResumeData>({
        personalInfo: {
            name: '',
            email: '',
            phone: '',
            location: '',
            website: '',
        },
        experience: [],
        education: [],
        skills: [],
    });

    const updateResume = (section: keyof ResumeData, data: any) => {
        setResumeData(prev => ({
            ...prev,
            [section]: data,
        }));
    };

    const value = { resumeData, updateResume };

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};