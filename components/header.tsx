"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation" // Import usePathname
import { Brain, Menu, X } from "lucide-react"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header(){
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname() // Get the current path

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onDashboard = pathname.startsWith('/dashboard');

  return (
    <header className={`fixed w-full z-50 transition-all ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Brain className="h-7 w-7 text-blue-600" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">Rex--AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <a href="/#features" className="text-slate-700 dark:text-slate-300 hover:text-blue-600">Features</a>
            <a href="/#how-it-works" className="text-slate-700 dark:text-slate-300 hover:text-blue-600">How It Works</a>
            <ThemeToggle />
            <div className="flex items-center space-x-3">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                {/* Conditionally render the Dashboard button */}
                {!onDashboard && (
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button aria-label="menu" onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <a href="/#features" className="block py-2 text-slate-700 dark:text-slate-300">Features</a>
            <a href="/#how-it-works" className="block py-2 text-slate-700 dark:text-slate-300">How It Works</a>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col space-y-2">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                {!onDashboard && (
                  <Link href="/dashboard">
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                )}
                <div className="pt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}