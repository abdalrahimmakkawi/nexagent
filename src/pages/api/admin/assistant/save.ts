import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const adminKey = req.headers['x-admin-key'] as string
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'nexagent-admin-2024'
  
  if (adminKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const { sessionId, title, messages, timestamp } = req.body

  if (!sessionId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Check if conversation already exists
    const { data: existing } = await supabaseAdmin
      .from('admin_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    const conversationData = {
      session_id: sessionId,
      title: title || 'Admin Conversation',
      messages: messages,
      created_at: timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    let result
    if (existing) {
      // Update existing conversation
      const { data, error } = await supabaseAdmin
        .from('admin_conversations')
        .update(conversationData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new conversation
      const { data, error } = await supabaseAdmin
        .from('admin_conversations')
        .insert(conversationData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return res.status(200).json({ 
      conversation: result,
      updated: !!existing
    })

  } catch (err) {
    console.error('[/api/admin/assistant/save]', err)
    return res.status(500).json({ error: 'Failed to save conversation' })
  }
}
