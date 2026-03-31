import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const adminKey = req.headers['x-admin-key'] as string
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'nexagent-admin-2024'
  
  if (adminKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  try {
    // Fetch all admin assistant conversations from database
    const { data: conversations, error } = await supabaseAdmin
      .from('admin_conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[/api/admin/assistant/history]', error)
      return res.status(500).json({ error: 'Failed to fetch conversation history' })
    }

    return res.status(200).json({ 
      conversations: conversations || [],
      count: conversations?.length || 0
    })

  } catch (err) {
    console.error('[/api/admin/assistant/history] Full error details:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack available',
      timestamp: new Date().toISOString()
    })
    return res.status(500).json({ error: 'Service temporarily unavailable' })
  }
}
