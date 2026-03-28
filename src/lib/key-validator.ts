// Validates that all required environment variables
// are present and correctly formatted at startup

const REQUIRED_ENV_VARS = [
  'DEEPSEEK_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'ADMIN_SECRET_KEY',
  'NEXT_PUBLIC_ADMIN_EMAIL',
  'N8N_WEBHOOK_BASE_URL',
  'STATS_SECRET_KEY',
]

export function validateEnvironment(): void {
  const missing: string[] = []
  const invalid: string[] = []

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key]
    if (!value) {
      missing.push(key)
      continue
    }
    // Basic format checks
    if (key === 'DEEPSEEK_API_KEY' && value.length < 20) {
      invalid.push(key)
    }
    if (key.includes('SUPABASE_URL') && !value.startsWith('https://')) {
      invalid.push(key)
    }
    if (key === 'NEXT_PUBLIC_ADMIN_EMAIL' && !value.includes('@')) {
      invalid.push(key)
    }
  }

  if (missing.length > 0) {
    console.error('[Security] Missing env vars:', missing)
  }
  if (invalid.length > 0) {
    console.error('[Security] Invalid env vars:', invalid)
  }
}
