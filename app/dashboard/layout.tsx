"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only run checks once loading is complete
    if (!loading) {
      // If no user, redirect to signin
      if (!user) {
        router.replace("/auth/signin")
        return
      }

      // If user exists but has not completed onboarding,
      // and they are not already trying to access the onboarding page,
      // redirect them there.
      if (!user.has_completed_onboarding && pathname !== "/auth/onboarding") {
        router.replace("/auth/onboarding")
      }
    }
  }, [user, loading, router, pathname])

  // While loading, or if the user is not yet available, show a full-page loader.
  // This prevents rendering the children (the page content) prematurely.
  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If the user is onboarded OR they are on the onboarding page, show the content.
  if (user.has_completed_onboarding || pathname === "/auth/onboarding") {
    return <>{children}</>
  }

  // As a fallback, show the loader while redirects are happening.
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}