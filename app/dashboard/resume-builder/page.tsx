import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wrench } from "lucide-react";

export default function ResumeBuilderPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
             <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard/ai-duo">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to AI DUO
                        </Button>
                        </Link>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">AI Resume Builder</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                <Wrench className="h-16 w-16 text-primary mb-4" />
                <h1 className="text-4xl font-bold mb-4">Coming Soon!</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    We're hard at work building a state-of-the-art AI Resume Builder. Check back soon to create a standout resume in minutes.
                </p>
            </div>
        </div>
    )
}
