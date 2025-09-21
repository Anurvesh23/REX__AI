"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { mockAPI } from "@/lib/api";
import type { MockInterview, MockTest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, TrendingUp, Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MockHistory() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [interviews, setInterviews] = useState<MockInterview[]>([]);
    const [tests, setTests] = useState<MockTest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MockInterview | MockTest | null>(null);
    const [itemType, setItemType] = useState<'interview' | 'test' | null>(null);


    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const [interviewData, testData] = await Promise.all([
                        mockAPI.getUserInterviews(user.id),
                        mockAPI.getUserMockTests(user.id)
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
            }
        };
        fetchHistory();
    }, [user, toast]);

    const handleViewDetails = (item: MockInterview | MockTest, type: 'interview' | 'test') => {
        setSelectedItem(item);
        setItemType(type);
    }

    if (isLoading) {
        return <Card><CardContent className="p-6 text-center">Loading history...</CardContent></Card>;
    }

    return (
        <>
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
                        {interviews.map(item => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold capitalize">{item.job_role} (Interview)</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Score: <strong className="text-primary">{item.overall_score}%</strong></span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(item, 'interview')}>View Feedback</Button>
                                </CardContent>
                            </Card>
                        ))}
                        {tests.map(item => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold capitalize">{item.job_role} (Test)</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Score: <strong className="text-primary">{item.overall_score}%</strong></span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(item, 'test')}>View Feedback</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{selectedItem?.job_role} ({itemType})</DialogTitle>
                        <DialogDescription>
                           Detailed analysis from {new Date(selectedItem?.created_at || "").toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-full pr-4">
                        <div className="text-sm whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-800 rounded-md p-4">
                           <h3 className="font-bold mt-4">Feedback:</h3>
                           <p>{selectedItem?.feedback}</p>
                           <h3 className="font-bold mt-4">Suggestions:</h3>
                           <ul>
                               {selectedItem?.suggestions?.map((suggestion, index) => (
                                   <li key={index}>{suggestion}</li>
                               ))}
                           </ul>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}