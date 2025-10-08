"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    // If Clerk has loaded and the user is not signed in, redirect to the sign-in page.
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  // While Clerk is loading, display a full-screen loader.
  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
    )
  }

  // If signed in, render the dashboard content.
  if (isSignedIn) {
    return <>{children}</>
  }
  
  // Return null while the redirect for non-signed-in users occurs.
  return null
}