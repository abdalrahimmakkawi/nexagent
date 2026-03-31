import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton instances to prevent multiple client creation
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    )
    console.log('🔍 [SUPABASE] Singleton client created')
  }
  return supabaseInstance
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
    console.log('🔍 [SUPABASE] Admin singleton client created')
  }
  return supabaseAdminInstance
}

// Export aliases for backward compatibility
export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdmin()
