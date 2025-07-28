import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Server-side client
export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}
