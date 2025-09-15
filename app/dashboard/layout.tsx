"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until the authentication state is fully loaded
    if (!loading) {
      // If there is no user, they should be sent to the sign-in page.
      if (!user) {
        router.replace("/auth/signin")
        return
      }

      // If the user exists but hasn't completed onboarding,
      // they should be sent to the onboarding page.
      if (!user.has_completed_onboarding) {
        router.replace("/auth/onboarding")
      }
    }
  }, [user, loading, router])

  // While loading or if the user is not onboarded yet, show a loader.
  // This prevents the dashboard content from flashing before the redirect happens.
  if (loading || !user || !user.has_completed_onboarding) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  // If the user is loaded and has completed onboarding, render the dashboard content.
  return <>{children}</>
}