import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { PLAN_AGENTS } from '@/lib/multi-agent'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientId, plan } = req.body

  if (!clientId || !plan) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const activeAgents = PLAN_AGENTS[plan] || PLAN_AGENTS.starter

    await supabaseAdmin
      .from('agent_teams')
      .upsert({
        client_id: clientId,
        plan,
        active_agents: activeAgents,
        updated_at: new Date().toISOString(),
      } as any)

    return res.status(200).json({ 
      success: true, 
      plan,
      activeAgents 
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/onboarding/set-plan] Full error:', message)
    console.error('[/api/onboarding/set-plan] Request body:', { clientId, plan })
    return res.status(500).json({ 
      error: 'Failed to set plan',
      detail: message
    })
  }
}
