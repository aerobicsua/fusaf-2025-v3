import { supabase } from './supabase'
import type {
  User,
  Club,
  Competition,
  Registration,
  AthleteProfile,
  CoachProfile,
  CompetitionWithClub,
  RegistrationWithDetails,
  UserWithProfiles
} from './supabase'

// User functions
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function updateUserProfile(id: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    return null
  }

  return data
}

export async function getUserWithProfiles(id: string): Promise<UserWithProfiles | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      athlete_profile:athlete_profiles(*),
      coach_profile:coach_profiles(*),
      club:clubs(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user with profiles:', error)
    return null
  }

  return data
}

// Club functions
export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching clubs:', error)
    return []
  }

  return data
}

export async function getClubsByOwner(ownerId: string): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name')

  if (error) {
    console.error('Error fetching clubs by owner:', error)
    return []
  }

  return data
}

export async function createClub(club: Omit<Club, 'id' | 'created_at' | 'updated_at'>): Promise<Club | null> {
  const { data, error } = await supabase
    .from('clubs')
    .insert(club)
    .select()
    .single()

  if (error) {
    console.error('Error creating club:', error)
    return null
  }

  return data
}

export async function updateClub(id: string, updates: Partial<Club>): Promise<Club | null> {
  const { data, error } = await supabase
    .from('clubs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating club:', error)
    return null
  }

  return data
}

// Competition functions
export async function getCompetitions(): Promise<CompetitionWithClub[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      club:clubs(*)
    `)
    .eq('status', 'published')
    .order('date')

  if (error) {
    console.error('Error fetching competitions:', error)
    return []
  }

  return data
}

export async function getCompetitionsByClub(clubId: string): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('club_id', clubId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching competitions by club:', error)
    return []
  }

  return data
}

export async function getCompetitionsByUser(userId: string): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('created_by', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching competitions by user:', error)
    return []
  }

  return data
}

export async function createCompetition(competition: Omit<Competition, 'id' | 'created_at' | 'updated_at'>): Promise<Competition | null> {
  const { data, error } = await supabase
    .from('competitions')
    .insert(competition)
    .select()
    .single()

  if (error) {
    console.error('Error creating competition:', error)
    return null
  }

  return data
}

export async function updateCompetition(id: string, updates: Partial<Competition>): Promise<Competition | null> {
  const { data, error } = await supabase
    .from('competitions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating competition:', error)
    return null
  }

  return data
}

export async function deleteCompetition(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting competition:', error)
    return false
  }

  return true
}

// Registration functions
export async function getRegistrationsByCompetition(competitionId: string): Promise<RegistrationWithDetails[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      competition:competitions(*),
      user:users(*)
    `)
    .eq('competition_id', competitionId)
    .order('registered_at')

  if (error) {
    console.error('Error fetching registrations:', error)
    return []
  }

  return data
}

export async function getRegistrationsByUser(userId: string): Promise<RegistrationWithDetails[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      competition:competitions(*),
      user:users(*)
    `)
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })

  if (error) {
    console.error('Error fetching user registrations:', error)
    return []
  }

  return data
}

export async function createRegistration(registration: Omit<Registration, 'id' | 'registered_at'>): Promise<Registration | null> {
  const registrationData = {
    ...registration,
    registered_at: registration.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('registrations')
    .insert(registrationData)
    .select()
    .single()

  if (error) {
    console.error('Error creating registration:', error)
    return null
  }

  return data
}

export async function updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating registration:', error)
    return null
  }

  return data
}

export async function cancelRegistration(competitionId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('registrations')
    .update({ status: 'cancelled' })
    .eq('competition_id', competitionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error cancelling registration:', error)
    return false
  }

  return true
}

// Profile functions
export async function getAthleteProfile(userId: string): Promise<AthleteProfile | null> {
  const { data, error } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching athlete profile:', error)
    return null
  }

  return data
}

export async function createAthleteProfile(profile: Omit<AthleteProfile, 'id' | 'created_at' | 'updated_at'>): Promise<AthleteProfile | null> {
  const { data, error } = await supabase
    .from('athlete_profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error creating athlete profile:', error)
    return null
  }

  return data
}

export async function updateAthleteProfile(userId: string, updates: Partial<AthleteProfile>): Promise<AthleteProfile | null> {
  const { data, error } = await supabase
    .from('athlete_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating athlete profile:', error)
    return null
  }

  return data
}

export async function getCoachProfile(userId: string): Promise<CoachProfile | null> {
  const { data, error } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching coach profile:', error)
    return null
  }

  return data
}

export async function createCoachProfile(profile: Omit<CoachProfile, 'id' | 'created_at' | 'updated_at'>): Promise<CoachProfile | null> {
  const { data, error } = await supabase
    .from('coach_profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error creating coach profile:', error)
    return null
  }

  return data
}

export async function updateCoachProfile(userId: string, updates: Partial<CoachProfile>): Promise<CoachProfile | null> {
  const { data, error } = await supabase
    .from('coach_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating coach profile:', error)
    return null
  }

  return data
}

// Statistics functions
export async function getCompetitionStats(competitionId: string) {
  const { data: registrations, error } = await supabase
    .from('registrations')
    .select('status, payment_status')
    .eq('competition_id', competitionId)

  if (error) {
    console.error('Error fetching competition stats:', error)
    return {
      total: 0,
      confirmed: 0,
      pending: 0,
      waitlist: 0,
      cancelled: 0,
      paid: 0
    }
  }

  interface StatsAccumulator {
    total: number;
    confirmed: number;
    pending: number;
    waitlist: number;
    cancelled: number;
    paid: number;
    [key: string]: number;
  }

  const stats = registrations.reduce((acc: StatsAccumulator, reg: { status: string, payment_status: string }) => {
    acc.total++
    // Count registration status
    if (reg.status in acc) {
      acc[reg.status]++
    }
    // Count payment status separately
    if (reg.payment_status === 'paid') {
      acc.paid++
    }
    return acc
  }, {
    total: 0,
    confirmed: 0,
    pending: 0,
    waitlist: 0,
    cancelled: 0,
    paid: 0
  })

  return stats
}

export async function getClubStats(clubId: string) {
  const [competitionsResult, athletesResult] = await Promise.all([
    supabase
      .from('competitions')
      .select('id')
      .eq('club_id', clubId),
    supabase
      .from('athlete_profiles')
      .select('id')
      .eq('club_id', clubId)
  ])

  return {
    competitions: competitionsResult.data?.length || 0,
    athletes: athletesResult.data?.length || 0
  }
}
