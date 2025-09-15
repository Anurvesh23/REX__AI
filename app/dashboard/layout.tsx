"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // After loading, if there's no user, redirect to the sign-in page.
    if (!loading && !user) {
      router.replace("/auth/signin")
    }
  }, [user, loading, router])

  // While loading or before the redirect happens, show a loader.
  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  // If a user is logged in, show the dashboard content.
  return <>{children}</>
}