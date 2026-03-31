import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 [SUPABASE] Missing environment variables')
}

// Singleton pattern to prevent multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    console.log('🔍 [SUPABASE] Creating singleton client...')
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      }
    )
    console.log('✅ [SUPABASE] Singleton client created successfully')
  }
  return supabaseInstance
})()

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    console.log('🔍 [SUPABASE] Creating admin singleton client...')
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    console.log('✅ [SUPABASE] Admin singleton client created successfully')
  }
  return supabaseAdminInstance
})()
