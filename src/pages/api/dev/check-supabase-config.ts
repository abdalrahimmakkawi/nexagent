import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NODE_ENV === 'production' &&
      req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY ? 'SET' : 'MISSING',
      N8N_WEBHOOK_BASE_URL: process.env.N8N_WEBHOOK_BASE_URL || 'NOT SET',
    }

    // Try to create admin client
    let adminClientWorking = false
    let adminClientError = ''

    try {
      const admin = supabaseAdmin
      
      if (admin) {
        // Test a simple query
        const { data, error } = await admin.from('clients').select('count').single()
        adminClientWorking = !error
        adminClientError = error?.message || ''
      } else {
        adminClientError = 'Admin client is null'
      }
    } catch (err) {
      adminClientError = err instanceof Error ? err.message : 'Unknown error'
    }

    return res.status(200).json({
      environment: process.env.NODE_ENV,
      envVars,
      adminClientWorking,
      adminClientError,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Check Supabase Config] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown'
    })
  }
}
