import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Create admin client directly to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientId } = req.query as { clientId: string }
  const { agentId, sessionId, loadHistory = false } = req.body

  if (!clientId || !agentId || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    console.log('[Conversation] Creating for:', { clientId, agentId, sessionId })

    // Check if conversation already exists for this session
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    console.log('[Conversation] Existing check:', { existing, existingError })

    const messages: any[] = []
    if (loadHistory && existing) {
      const { data: messageHistory } = await supabaseAdmin
        .from('messages')
        .select('role, content, created_at, provider')
        .eq('conversation_id', existing.id)
        .order('created_at', { ascending: true })
        .limit(50)

      messages.push(...(messageHistory || []))
      console.log('[Conversation] History loaded:', messageHistory?.length || 0)
    }

    if (existing) {
      console.log('[Conversation] Found existing:', existing.id)
      return res.status(200).json({ 
        conversationId: existing.id,
        messages: messages,
        isNew: false
      })
    }

    // Get client's agent to find client_id
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('client_id')
      .eq('id', agentId)
      .single()

    console.log('[Conversation] Agent lookup:', { agent, agentError })

    if (!agent || agentError) {
      console.error('[Conversation] Agent not found:', agentError)
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Create new conversation with admin client to bypass RLS
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .insert({
        agent_id: agentId,
        client_id: agent.client_id,
        session_id: sessionId,
        source: 'widget',
      })
      .select()
      .single()

    console.log('[Conversation] Created:', { conversation, convError })

    if (convError || !conversation) {
      console.error('[Conversation] Creation failed:', convError)
      return res.status(500).json({ 
        error: 'Failed to create conversation',
        details: convError?.message 
      })
    }

    return res.status(200).json({ 
      conversationId: conversation.id,
      messages: [],
      isNew: true
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown'
    console.error('[/api/widget/conversation] Error:', message)
    return res.status(500).json({ 
      error: 'Failed to create conversation',
      details: message
    })
  }
}
