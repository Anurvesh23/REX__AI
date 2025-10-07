"use client"

import { useRouter } from "next/navigation"
import { ClerkProvider } from "@clerk/nextjs"
import React from "react"

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // navigate function to allow Clerk to use Next.js navigation
  const navigate = (to: string) => {
    // Use replace for navigation triggered by auth to avoid extra history entries
    router.replace(to)
  }

  // NEXT_PUBLIC_... is available in client-side code at build time
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  )
}
