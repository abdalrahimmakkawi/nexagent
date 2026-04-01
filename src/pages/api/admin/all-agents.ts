import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Admin secret key protection
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    console.warn('Unauthorized access attempt to /api/admin/all-agents')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Fetch all agents with client info
    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select('*, clients(*)')
      .in('status', ['active', 'pending_review', 'building', 'generating'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[ADMIN_ALL_AGENTS] Error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch agents',
        details: error.message 
      })
    }

    return res.status(200).json({
      agents: agents || [],
      count: agents?.length || 0
    })

  } catch (error) {
    console.error('[ADMIN_ALL_AGENTS] Error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch agents',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
