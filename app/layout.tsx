// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header" // Assuming you have a Header component
import ClerkProviderWrapper from "@/components/clerk-provider-wrapper"
import RedirectOnAuth from "@/components/redirect-on-auth"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rex--AI - AI-Powered Career Tools",
  description: "Upgrade your resume with AI precision and land your dream job faster",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The publishable key should be in your .env.local file
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <ClerkProviderWrapper>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* The Header component will now appear on all pages */}
            <Header />
            <RedirectOnAuth />
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  )
}