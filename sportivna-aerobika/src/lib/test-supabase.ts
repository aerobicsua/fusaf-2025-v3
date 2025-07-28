import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function testSupabaseConnection(): Promise<{success: boolean, error?: string}> {
  try {
    console.log('🔗 Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey.substring(0, 20) + '...')

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('💡 Database schema needs to be created!')
      }
      return { success: false, error: error.message }
    }

    console.log('✅ Supabase connection successful!')
    return { success: true }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return { success: false, error: String(error) }
  }
}

export async function checkTables(): Promise<Record<string, boolean>> {
  try {
    console.log('📊 Checking database tables...')

    // Check if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (usersError) {
      console.log('❌ Users table not found. Schema needs to be created.')
      return { users: false }
    }

    console.log('✅ Users table exists')

    // Check other tables
    const tables = ['clubs', 'competitions', 'registrations', 'athlete_profiles', 'coach_profiles']
    const results: Record<string, boolean> = { users: true }

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (error) {
        console.log(`❌ ${table} table not found`)
        results[table] = false
      } else {
        console.log(`✅ ${table} table exists`)
        results[table] = true
      }
    }

    return results
  } catch (error) {
    console.error('❌ Error checking tables:', error)
    return {}
  }
}

// For use in browser console or during development
// if (typeof window !== 'undefined') {
//   (window as any).testSupabase = testSupabaseConnection
// }
