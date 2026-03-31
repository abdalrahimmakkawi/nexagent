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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('🚨 [SUPABASE] Missing environment variables:')
      console.error('🚨 [SUPABASE] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Missing')
      console.error('🚨 [SUPABASE] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌ Missing')
      throw new Error('Supabase environment variables are not configured properly')
    }
    
    console.log('🔍 [SUPABASE] Creating singleton client...')
    supabaseInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ [SUPABASE] Admin environment variables not available (admin features disabled)')
      console.warn('⚠️ [SUPABASE] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Missing')
      console.warn('⚠️ [SUPABASE] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌ Missing')
      // Return a mock admin client that won't crash the app
      return null as any
    }
    
    console.log('� [SUPABASE] Creating admin singleton client...')
    supabaseAdminInstance = createClient(
      supabaseUrl,
      supabaseServiceKey
    )
    console.log('✅ [SUPABASE] Admin singleton client created successfully')
  }
  return supabaseAdminInstance
})()
