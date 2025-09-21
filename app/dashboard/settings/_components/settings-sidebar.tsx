"use client"

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, FileText, Bookmark, Send, Settings, Lock, Bell, LogOut, History } from "lucide-react";
import Link from "next/link";

type SettingsTab = "profile" | "account" | "password" | "notifications" | "resume" | "interviews" | "saved" | "submissions";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "resume", label: "Resume Analyses", icon: History },
    { id: "interviews", label: "Interview History", icon: History },
    { id: "saved", label: "Saved Jobs", icon: Bookmark, isLink: true, href: "/dashboard/job-search" },
    { id: "submissions", label: "My Submissions", icon: Send },
    { id: "account", label: "Account Settings", icon: Settings },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notification Settings", icon: Bell },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.full_name} />
            <AvatarFallback>{user?.user_metadata.full_name ? getInitials(user.user_metadata.full_name) : 'U'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold truncate">{user?.user_metadata.full_name || "User"}</div>
            <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {navItems.map((item) => (
            item.isLink ? (
                <Link href={item.href || "#"} key={item.id}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Button>
                </Link>
            ) : (
                <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab(item.id as SettingsTab)}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Button>
            )
        ))}
         <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={signOut}
        >
            <LogOut className="h-4 w-4" />
            Logout
        </Button>
      </div>
    </div>
  );
}