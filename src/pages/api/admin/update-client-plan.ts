import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Admin secret key protection
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    console.warn('Unauthorized access attempt to /api/admin/update-client-plan')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { clientId, plan } = req.body

    if (!clientId || !plan) {
      return res.status(400).json({ error: 'Missing clientId or plan' })
    }

    // Update client plan
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({ plan })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('[UPDATE_CLIENT_PLAN] Error:', error)
      return res.status(500).json({ 
        error: 'Failed to update client plan',
        details: error.message 
      })
    }

    return res.status(200).json({
      success: true,
      message: `Client plan updated to ${plan}`,
      client: data
    })

  } catch (error) {
    console.error('[UPDATE_CLIENT_PLAN] Error:', error)
    return res.status(500).json({ 
      error: 'Failed to update client plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
