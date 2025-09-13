import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/hooks/useAuth"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rex--AI - AI-Powered Career Tools",
  description: "Upgrade your resume with AI precision and land your dream job faster",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Provide auth context app-wide */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
