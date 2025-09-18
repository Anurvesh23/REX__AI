"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <h3 className="text-md font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
                Permanently delete your account and all of your content. This action is not reversible.
            </p>
            <Button variant="destructive">Delete My Account</Button>
        </div>
      </CardContent>
    </Card>
  );
}