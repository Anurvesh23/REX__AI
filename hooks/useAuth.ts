// hooks/useAuth.ts
"use client";

import { useUser } from "@clerk/nextjs";

export function useAuth() {
  const { isSignedIn, user } = useUser();
  return { isSignedIn, user };
}