"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If loading is finished and there's no user, redirect to the sign-in page.
    if (!loading && !user) {
      router.replace("/auth/signin")
    }
  }, [user, loading, router])

  // While the authentication state is loading, display a full-screen loader.
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  // If loading is complete but there is no authenticated user,
  // return null. The useEffect above will handle the redirect.
  // This prevents the dashboard content from flashing.
  if (!user) {
    return null;
  }

  // If a user is logged in, render the dashboard content.
  return <>{children}</>
}