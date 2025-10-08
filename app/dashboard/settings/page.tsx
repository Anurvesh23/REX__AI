"use client"

import { useState, Suspense, lazy } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SettingsSidebar from "./_components/settings-sidebar";

// Lazy load setting components for faster initial load
const ProfileSettings = lazy(() => import("./_components/profile-settings"));
const PasswordSettings = lazy(() => import("./_components/password-settings"));
const AccountSettings = lazy(() => import("./_components/account-settings"));
const NotificationSettings = lazy(() => import("./_components/notification-settings"));
const ResumeAnalysisHistory = lazy(() => import("./_components/resume-analysis-history"));
const MockHistory = lazy(() => import("./_components/mock-interview-history"));

// Placeholder for My Submissions
const MySubmissions = () => (
    <Card>
        <CardHeader>
            <CardTitle>My Submissions</CardTitle>
            <CardDescription>Track the status of your job applications.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Send className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground">Application tracking will be available here.</p>
        </CardContent>
    </Card>
);

type SettingsTab = "profile" | "account" | "password" | "notifications" | "resume" | "interviews" | "saved" | "submissions";

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8 h-full rounded-lg bg-card">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings />;
      case "password": return <PasswordSettings />;
      case "account": return <AccountSettings />;
      case "notifications": return <NotificationSettings />;
      case "resume": return <ResumeAnalysisHistory />;
      case "interviews": return <MockHistory />;
      case "submissions": return <MySubmissions />;
      default: return null; // "Saved Jobs" is a link and does not render content here
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16">
      <header className="bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b fixed top-16 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>
          <section className="md:col-span-3">
            <Suspense fallback={<LoadingComponent />}>
              {renderContent()}
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}