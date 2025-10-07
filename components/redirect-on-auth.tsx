"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function RedirectOnAuth() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoaded) return

    // Only redirect when user is signed in and is on an auth or root page
    const onAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up") || pathname === "/"
    if (isSignedIn && onAuthPage) {
      router.replace("/dashboard")
    }
  }, [isLoaded, isSignedIn, pathname, router])

  return null
}
