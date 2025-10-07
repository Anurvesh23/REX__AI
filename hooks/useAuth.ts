// hooks/useAuth.ts
"use client";

import { useUser } from "@clerk/nextjs";

// Lightweight wrapper around Clerk's useUser to provide a consistent
// shape for components. Returns `user`, `isSignedIn` and `loading`.
export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const loading = !isLoaded;
  return { user, isSignedIn, loading };
}