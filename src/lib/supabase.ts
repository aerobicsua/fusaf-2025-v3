import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client-side Supabase client
export const supabase = createClientComponentClient()

// Alternative client for direct usage
export const createClient = () => {
  return createClientComponentClient()
}

// Server-side client (for server components)
export const supabaseServer = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  role: 'athlete' | 'coach' | 'judge' | 'club_owner'
  phone?: string
  date_of_birth?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Club {
  id: string
  name: string
  address: string
  city?: string
  phone?: string
  email?: string
  website?: string
  owner_id: string
  description?: string
  founded_year?: number
  created_at: string
  updated_at: string
}

export interface Competition {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location: string
  address: string
  registration_fee: number
  entry_fee?: number
  max_participants?: number
  age_groups: string[]
  categories: string[]
  category?: 'open' | 'junior' | 'senior' | 'professional' | 'amateur'
  club_id: string
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled'
  registration_deadline: string
  rules_and_regulations?: string
  contact_info?: string
  prizes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  user_id: string
  competition_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  registration_date: string
  age_group?: string
  category?: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AthleteProfile {
  id: string
  user_id: string
  club_id?: string
  coach_id?: string
  level: string
  achievements?: string
  medical_clearance: boolean
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
}

export interface CoachProfile {
  id: string
  user_id: string
  club_id?: string
  license_number?: string
  specializations?: string[]
  experience_years?: number
  qualifications?: string
  bio?: string
  created_at: string
  updated_at: string
}

// Extended types for joins
export interface CompetitionWithClub extends Competition {
  club: Club
}

export interface RegistrationWithDetails extends Registration {
  user: User
  competition: Competition
}

export interface UserWithProfiles extends User {
  athlete_profile?: AthleteProfile
  coach_profile?: CoachProfile
}
