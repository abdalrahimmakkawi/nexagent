import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Singleton pattern to prevent multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured properly')
    }
    
    supabaseInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
            try {
              // Try the standard LockManager first
              if (navigator.locks && navigator.locks.request) {
                return await navigator.locks.request(name, { ifAvailable: true }, fn)
              }
            } catch (e) {
              // Fallback for browsers that don't support LockManager properly
              console.warn('LockManager not supported, using fallback')
            }
            // Workaround for browsers that don't support LockManager properly
            return fn()
          },
        }
      }
    )
  }
  return supabaseInstance
})()

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
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
