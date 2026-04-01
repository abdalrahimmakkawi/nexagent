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
    console.warn('Unauthorized access attempt to /api/admin/stats')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get counts from all tables
    const [
      { count: totalClients },
      { count: pendingReview },
      { count: activeAgents },
      { count: totalLeads },
      { count: pendingAgents }
    ] = await Promise.all([
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).in('status', ['pending_review', 'building', 'generating'])
    ])

    return res.status(200).json({
      totalClients: totalClients || 0,
      pendingReview: pendingReview || 0,
      activeAgents: activeAgents || 0,
      totalLeads: totalLeads || 0,
      pendingAgents: pendingAgents || 0
    })

  } catch (error) {
    console.error('[ADMIN_STATS] Error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
