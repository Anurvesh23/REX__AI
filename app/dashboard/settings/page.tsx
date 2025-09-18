"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsSidebar from "./_components/settings-sidebar";
import ProfileSettings from "./_components/profile-settings";
import PasswordSettings from "./_components/password-settings";
import AccountSettings from "./_components/account-settings";
import NotificationSettings from "./_components/notification-settings";

type SettingsTab = "profile" | "account" | "password" | "notifications" | "resume" | "saved" | "submissions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "password":
        return <PasswordSettings />;
      case "account":
        return <AccountSettings />;
      case "notifications":
        return <NotificationSettings />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold">Feature Coming Soon</h2>
            <p className="text-muted-foreground mt-2">This section is currently under development.</p>
          </div>
        );
    }
  };

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
            <span className="text-xl font-bold text-slate-900 dark:text-white">Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="md:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}