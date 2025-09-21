"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { interviewAPI } from "@/lib/api";
import type { Interview } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, TrendingUp, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function MockInterviewHistory() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [history, setHistory] = useState<Interview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const data = await interviewAPI.getUserInterviews(user.id);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to fetch interview history:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load your interview history.",
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchHistory();
    }, [user, toast]);

    if (isLoading) {
        return <Card><CardContent className="p-6 text-center">Loading history...</CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mock Interview & Test History</CardTitle>
                <CardDescription>Review your past performance and feedback.</CardDescription>
            </CardHeader>
            <CardContent>
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No History Found</h3>
                        <p className="text-muted-foreground">You haven't completed any mock interviews or tests yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map(item => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold capitalize">{item.job_role} ({item.difficulty})</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Score: <strong className="text-primary">{item.overall_score}%</strong></span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View Feedback</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}