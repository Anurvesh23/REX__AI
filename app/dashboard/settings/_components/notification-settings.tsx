"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications from us.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="job-alerts" className="flex flex-col space-y-1">
                <span>Job Alerts</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Receive email notifications for new jobs that match your profile.
                </span>
            </Label>
            <Switch id="job-alerts" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="weekly-summary" className="flex flex-col space-y-1">
                <span>Weekly Summary</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Get a weekly summary of your job search activity and progress.
                </span>
            </Label>
            <Switch id="weekly-summary" />
        </div>
         <div className="flex justify-end">
            <Button>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}