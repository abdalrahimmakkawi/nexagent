import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Singleton pattern to prevent multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
})()

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey
    )
  }
  return supabaseAdminInstance
})()
