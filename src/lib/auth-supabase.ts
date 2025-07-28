import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

// Client-side auth functions
export const useSupabaseAuth = () => {
  const supabase = createClientComponentClient()

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
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
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  }

  const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    return session
  }

  return {
    signInWithGoogle,
    signOut,
    getUser,
    getSession,
    supabase,
  }
}

// Get user profile from our custom users table
export const getUserProfile = async (userId: string) => {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }

  return data
}

// Create or update user profile after OAuth sign in
export const upsertUserProfile = async (user: User) => {
  const supabase = createClientComponentClient()

  const userData = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(userData, {
      onConflict: 'id',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user profile:', error)
    return null
  }

  return data
}

// Type definitions
export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'athlete' | 'club_owner' | 'coach_judge' | 'admin'
  phone?: string
  date_of_birth?: string
  city?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<{ provider: string; url: string } | void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}
