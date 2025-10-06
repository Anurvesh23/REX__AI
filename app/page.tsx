// app/page.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  // ... (rest of your component)

  return (
    // ...
    <nav>
      {/* ... */}
      <div className="hidden md:flex items-center space-x-4">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost">Sign In</Button>
          </SignInButton>
          <Link href="/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
      {/* ... */}
    </nav>
    // ...
  );
}