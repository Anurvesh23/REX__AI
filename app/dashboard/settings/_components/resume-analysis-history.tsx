"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { resumeAPI } from "@/lib/api";
import type { ResumeAnalysis } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ResumeAnalysisHistory() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [history, setHistory] = useState<ResumeAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const data = await resumeAPI.getUserResumes(user.id);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to fetch resume analysis history:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load your resume analysis history.",
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchHistory();
    }, [user, toast]);

    const handleDelete = async (resumeId: string) => {
        if (confirm("Are you sure you want to delete this analysis? This action cannot be undone.")) {
            try {
                await resumeAPI.deleteResume(resumeId);
                setHistory(history.filter(item => item.id !== resumeId));
                toast({
                    title: "Success",
                    description: "Analysis deleted successfully.",
                });
            } catch (error) {
                console.error("Failed to delete analysis:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not delete the analysis.",
                });
            }
        }
    };

    if (isLoading) {
        return <Card><CardContent className="p-6 text-center">Loading history...</CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resume Analysis History</CardTitle>
                <CardDescription>Review your past resume analyses and track your improvements.</CardDescription>
            </CardHeader>
            <CardContent>
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No History Found</h3>
                        <p className="text-muted-foreground">You haven't analyzed any resumes yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map(item => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{item.job_title || "General Analysis"}</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Score: <strong className="text-primary">{item.overall_score}%</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">View Details</Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}