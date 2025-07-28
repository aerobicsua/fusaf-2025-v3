"use client"

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from URL parameters
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error in auth callback:', error)
          router.push('/?error=auth_failed')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to role selection or dashboard
          const { data: userProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.session.user.id)
            .single()

          if (!userProfile?.role || userProfile.role === 'athlete') {
            // New user or no role set, go to role selection
            router.push('/auth/role-selection')
          } else {
            // Existing user with role, go to appropriate dashboard
            switch (userProfile.role) {
              case 'athlete':
                router.push('/dashboard/athlete')
                break
              case 'club_owner':
                router.push('/dashboard/club-owner')
                break
              case 'coach_judge':
                router.push('/dashboard/coach-judge')
                break
              case 'admin':
                router.push('/dashboard/admin')
                break
              default:
                router.push('/')
            }
          }
        } else {
          // No session, redirect to home
          router.push('/')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
        <p className="mt-4 text-gray-600">Завершення входу...</p>
      </div>
    </div>
  )
}
