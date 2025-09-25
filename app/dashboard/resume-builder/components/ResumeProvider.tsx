"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { templates } from './templates';

// --- Type Definitions ---
export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: string;
    school: string;
    location: string;
    degree: string;
    field: string;
    graduationDate: string;
}

export interface Skill {
    id: string;
    name: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
}

export interface Template {
    id: string;
    name: string;
    thumbnail: string;
    component: React.FC;
}

export interface ResumeContextType {
    resumeData: ResumeData;
    updateField: (section: keyof ResumeData, index: number | null, field: string, value: string) => void;
    addListItem: (section: 'experience' | 'education' | 'skills') => void;
    removeListItem: (section: 'experience' | 'education' | 'skills', id: string) => void;
    updateListItem: (section: 'experience' | 'education' | 'skills', id: string, field: string, value: string) => void;
    selectedTemplate: Template | null;
    setTemplate: (template: Template) => void;
}


// --- Initial State ---
const initialResumeData: ResumeData = {
    personalInfo: {
        name: 'Anurvesh Reddy',
        email: 'munugalaanurveshreddy@gmail.com',
        phone: '+91 12345 67890',
        location: 'Hyderabad, India',
        website: 'portfolio.dev',
        linkedin: 'linkedin.com/in/anurvesh',
        github: 'github.com/anurvesh23'
    },
    experience: [],
    education: [],
    skills: [],
};


// --- Context and Provider ---
const ResumeContext = createContext<ResumeContextType | null>(null);

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error("useResume must be used within a ResumeProvider");
    }
    return context;
};

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const setTemplate = (template: Template) => {
        setSelectedTemplate(template);
    };

    const updateField = (section: keyof ResumeData, index: number | null, field: string, value: string) => {
        setResumeData(prev => {
            const newData = { ...prev };
            if (index === null) {
                // For non-array sections like personalInfo
                (newData[section] as any)[field] = value;
            }
            return newData;
        });
    };

    const updateListItem = (section: 'experience' | 'education' | 'skills', id: string, field: string, value: any) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addListItem = (section: 'experience' | 'education' | 'skills') => {
        let newItem;
        switch (section) {
            case 'experience':
                newItem = { id: uuidv4(), title: '', company: '', location: '', startDate: '', endDate: '', description: '' };
                break;
            case 'education':
                newItem = { id: uuidv4(), school: '', location: '', degree: '', field: '', graduationDate: '' };
                break;
            case 'skills':
                newItem = { id: uuidv4(), name: '' };
                break;
            default:
                return;
        }
        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem] as any,
        }));
    };


    const removeListItem = (section: 'experience' | 'education' | 'skills', id: string) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id),
        }));
    };

    const value = {
        resumeData,
        updateField,
        addListItem,
        removeListItem,
        updateListItem,
        selectedTemplate,
        setTemplate,
    };

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};