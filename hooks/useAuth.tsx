"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Define a more detailed user profile type
export interface UserProfile extends User {
  full_name: string
  avatar_url: string
  has_completed_onboarding: boolean
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check the session on initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser({ ...session.user, ...userProfile })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser({ ...session.user, ...userProfile })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  const value = { user, loading, signIn, signUp, signOut, signInWithGoogle }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}