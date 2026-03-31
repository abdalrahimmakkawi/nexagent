import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Safe fallback for when Supabase is not available
let safeSupabaseClient: SupabaseClient | null = null
let isSupabaseAvailable = false

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseAnonKey) {
    safeSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    isSupabaseAvailable = true
    console.log('✅ [SUPABASE_SAFE] Safe client initialized')
  } else {
    console.warn('⚠️ [SUPABASE_SAFE] Environment variables not available')
  }
} catch (error) {
  console.error('🚨 [SUPABASE_SAFE] Failed to initialize:', error)
}

export function getSafeSupabaseClient(): SupabaseClient | null {
  return safeSupabaseClient
}

export function isSupabaseReady(): boolean {
  return isSupabaseAvailable
}

// Export a safe wrapper that won't crash the app
export const safeSupabase = {
  auth: {
    signInWithPassword: async (credentials: any) => {
      if (!isSupabaseAvailable) {
        throw new Error('Supabase is not available')
      }
      return safeSupabaseClient!.auth.signInWithPassword(credentials)
    },
    signOut: async () => {
      if (!isSupabaseAvailable) {
        throw new Error('Supabase is not available')
      }
      return safeSupabaseClient!.auth.signOut()
    },
    getSession: async () => {
      if (!isSupabaseAvailable) {
        return { data: { session: null }, error: null }
      }
      return safeSupabaseClient!.auth.getSession()
    },
    onAuthStateChange: (callback: any) => {
      if (!isSupabaseAvailable) {
        return { data: { subscription: null }, error: null }
      }
      return safeSupabaseClient!.auth.onAuthStateChange(callback)
    }
  },
  from: (table: string) => {
    if (!isSupabaseAvailable) {
      throw new Error('Supabase is not available')
    }
    return safeSupabaseClient!.from(table)
  }
}
