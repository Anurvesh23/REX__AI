"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export default function ProfileSettings() {
    const { user } = useAuth();
    const u = user as any;
    const getDisplayName = (u: any) => {
        if (!u) return '';
        return (
            u?.user_metadata?.full_name ||
            u?.unsafeMetadata?.full_name ||
            (u?.firstName && u?.lastName ? `${u.firstName} ${u.lastName}` : null) ||
            u?.fullName ||
            u?.primaryEmailAddress?.emailAddress ||
            u?.email ||
            ''
        );
    }
    const { toast } = useToast();

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically call an updateUser function
        // For now, we'll just show a success toast
        toast({
            title: "Profile Updated",
            description: "Your profile details have been successfully saved.",
        });
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your personal and professional information.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6" onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" defaultValue={getDisplayName(u)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" defaultValue={(u?.primaryEmailAddress?.emailAddress || u?.email) || ''} disabled />
                        </div>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" type="tel" placeholder="+91 12345 67890" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input id="linkedin" placeholder="https://linkedin.com/in/your-profile" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input id="github" placeholder="https://github.com/your-username" />
                    </div>
                    
                    <div className="flex justify-end">
                        <Button type="submit">Update Profile</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}