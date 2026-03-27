import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientId } = req.query as { clientId: string }
  const { agentId, sessionId } = req.body

  if (!clientId || !agentId || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Check if conversation already exists for this session
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (existing) {
      return res.status(200).json({ conversationId: existing.id })
    }

    // Get client's agent to find client_id
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('client_id')
      .eq('id', agentId)
      .single()

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Create new conversation
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .insert({
        agent_id: agentId,
        client_id: agent.client_id,
        session_id: sessionId,
        source: 'widget',
      })
      .select()
      .single()

    return res.status(200).json({ 
      conversationId: conversation?.id 
    })
  } catch (err) {
    console.error('[/api/widget/conversation]', err)
    return res.status(500).json({ error: 'Failed to create conversation' })
  }
}
