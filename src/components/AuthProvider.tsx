"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { upsertUserProfile, getUserProfile, type UserProfile, type AuthContextType } from '@/lib/auth-supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(user)
        await loadUserProfile(user.id)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)

        if (session?.user) {
          setUser(user)

          // Upsert user profile on sign in
          if (event === 'SIGNED_IN') {
            const updatedProfile = await upsertUserProfile(user)
            if (updatedProfile) {
              setProfile(updatedProfile)

              // Redirect to role selection if no role set
              if (!updatedProfile.role || updatedProfile.role === 'athlete') {
                router.push('/auth/role-selection')
              }
            }
          } else {
            await loadUserProfile(user.id)
          }
        } else {
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const loadUserProfile = async (userId: string) => {
    const userProfile = await getUserProfile(userId)
    setProfile(userProfile)
  }

  const signInWithGoogle = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : 'https://same-eikk4fzfmr5-latest.netlify.app/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Error signing in:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Error signing out:', error)
        throw error
      }

      setUser(null)
      setProfile(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return default values during SSR instead of throwing error
    if (typeof window === 'undefined') {
      return {
        user: null,
        profile: null,
        loading: true,
        signInWithGoogle: async () => {},
        signOut: async () => {},
        refreshProfile: async () => {},
      }
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for checking if user has specific role
export function useRole(allowedRoles: string | string[]) {
  const { profile } = useAuth()

  if (!profile) return false

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(profile.role)
}

// Hook for protecting routes that require authentication
export function useRequireAuth(redirectTo = '/') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}
