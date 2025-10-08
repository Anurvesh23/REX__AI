"use client"

import { useState, Suspense, lazy } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsSidebar from "./_components/settings-sidebar";

// Lazy load setting components for faster initial load
const ProfileSettings = lazy(() => import("./_components/profile-settings"));
const PasswordSettings = lazy(() => import("./_components/password-settings"));
const AccountSettings = lazy(() => import("./_components/account-settings"));
const NotificationSettings = lazy(() => import("./_components/notification-settings"));
const ResumeAnalysisHistory = lazy(() => import("./_components/resume-analysis-history"));
const MockHistory = lazy(() => import("./_components/mock-interview-history"));

type SettingsTab = "profile" | "account" | "password" | "notifications" | "resume" | "interviews" | "saved" | "submissions";

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8 h-full">
    <Loader2 className="h-8 w-8 animate-spin" />
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
      default:
        return (
          <div className="p-8 text-center rounded-lg bg-card">
            <h2 className="text-xl font-semibold">Feature Coming Soon</h2>
            <p className="text-muted-foreground mt-2">This section is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="md:col-span-3">
            <Suspense fallback={<LoadingComponent />}>
              {renderContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}