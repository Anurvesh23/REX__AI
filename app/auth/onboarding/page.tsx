"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCompleteOnboarding = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id)

      if (error) throw error
      
      // A full page reload ensures the AuthProvider re-evaluates the user's
      // onboarding status before redirecting to the dashboard.
      window.location.href = "/dashboard";
      
    } catch (error: any) {
      alert(`An error occurred: ${error.message}`)
      setIsSubmitting(false)
    }
  }
  
  // Show a loader while auth state is being confirmed.
  // This prevents rendering the card before user data is available.
  if (loading || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <Loader2 className="animate-spin h-8 w-8 text-white" />
        </div>
    )
  }

  // This content will only render if `loading` is false AND `user` is not null.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Rex--AI!</CardTitle>
          <CardDescription>Just one more step to get started.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Welcome, <strong>{user.full_name || user.email}</strong>!
            <br />
            Click the button below to complete your registration.
          </p>
          <Button onClick={handleCompleteOnboarding} disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Sign Up & Go to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}