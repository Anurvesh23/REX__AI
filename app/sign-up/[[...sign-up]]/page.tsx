"use client"

import { SignUp, useUser } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center space-x-3 mb-8">
        <Brain className="h-12 w-12 text-blue-600" />
        <span className="text-4xl font-bold text-slate-900 dark:text-white">Rex--AI</span>
      </div>
      <SignUp afterSignUpUrl="/dashboard" />
    </div>
  );
}