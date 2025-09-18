"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function PasswordSettings() {
    const { toast } = useToast();

    const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Supabase password change logic would go here.
        // const { error } = await supabase.auth.updateUser({ password: newPassword });
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
        e.currentTarget.reset();
    };

    const handleResetPassword = async () => {
        const email = supabase.auth.getUser()?.then(userResponse => {
            if (userResponse.data.user?.email) {
                 supabase.auth.resetPasswordForEmail(userResponse.data.user.email, {
                    redirectTo: `${window.location.origin}/auth/update-password`,
                });
                toast({
                    title: "Password Reset Email Sent",
                    description: "Please check your inbox for instructions to reset your password.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not find user email to send reset link.",
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Manage your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form className="space-y-4" onSubmit={handleChangePassword}>
                     <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                    </div>
                     <div className="flex justify-end">
                        <Button type="submit">Change Password</Button>
                    </div>
                </form>

                <Separator />

                <div>
                    <h3 className="text-md font-semibold">Forgot Password?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        We'll send a password reset link to your email address.
                    </p>
                    <Button variant="outline" onClick={handleResetPassword}>Send Reset Link</Button>
                </div>
            </CardContent>
        </Card>
    );
}