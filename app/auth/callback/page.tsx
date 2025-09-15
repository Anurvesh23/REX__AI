"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // This effect runs whenever the loading or user state changes.
    if (!loading) {
      if (user) {
        // If loading is complete and we have a user, redirect to the dashboard.
        router.replace("/dashboard")
      } else {
        // If loading is complete but there's no user, something went wrong.
        // This could happen if the user cancels the OAuth flow.
        // Redirect back to the sign-in page.
        console.error("Authentication failed or was cancelled by the user.")
        router.replace("/auth/signin")
      }
    }
  }, [user, loading, router])

  // Display a loading message while the session is being established.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Authenticating...
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Please wait while we finalize your login.
        </p>
      </div>
    </div>
  )
}