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

  const { clientId } = req.query

  if (!clientId) {
    return res.status(400).json({ error: 'Client ID required' })
  }

  try {
    console.log('[DEBUG] Looking for client ID:', clientId)

    // Check if client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    console.log('[DEBUG] Client result:', { client, clientError })

    // Check all agents for this client
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('client_id', clientId)

    console.log('[DEBUG] Agents result:', { agents, agentsError })

    // Check active agents specifically
    const { data: activeAgents, error: activeError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')

    console.log('[DEBUG] Active agents result:', { activeAgents, activeError })

    return res.status(200).json({
      clientId,
      clientExists: !!client,
      client: client,
      totalAgents: agents?.length || 0,
      agents: agents || [],
      activeAgentsCount: activeAgents?.length || 0,
      activeAgents: activeAgents || [],
      errors: {
        client: clientError?.message,
        agents: agentsError?.message,
        active: activeError?.message
      }
    })

  } catch (error) {
    console.error('[DEBUG CLIENT] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown'
    })
  }
}
