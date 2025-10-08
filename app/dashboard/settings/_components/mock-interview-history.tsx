"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { mockAPI } from "@/lib/api";
import type { MockInterview, MockTest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MockHistory() {
    const { getToken, userId } = useAuth();
    const { toast } = useToast();
    const [interviews, setInterviews] = useState<MockInterview[]>([]);
    const [tests, setTests] = useState<MockTest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MockInterview | MockTest | null>(null);
    const [itemType, setItemType] = useState<'interview' | 'test' | null>(null);


    useEffect(() => {
        const fetchHistory = async () => {
            if (userId && getToken) {
                try {
                    const [interviewData, testData] = await Promise.all([
                        mockAPI.getUserInterviews(getToken, userId),
                        mockAPI.getUserMockTests(getToken, userId)
                    ]);
                    setInterviews(interviewData);
                    setTests(testData);
                } catch (error) {
                    console.error("Failed to fetch history:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load your history.",
                    });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [userId, getToken, toast]);

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
                {interviews.length === 0 && tests.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No History Found</h3>
                        <p className="text-muted-foreground">You haven't completed any mock interviews or tests yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Map over interviews and tests to display them */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}