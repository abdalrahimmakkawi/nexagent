import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientId } = req.query as { clientId: string }

  if (!clientId) {
    return res.status(400).json({ error: 'Client ID required' })
  }

  try {
    const { data: agent } = await (supabaseAdmin
      .from('agents') as any)
      .select(`
        id, name, system_prompt, welcome_message,
        quick_prompts, lead_field, lead_message,
        widget_color, widget_position, status,
        clients(id, email)
      `)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found or not active' 
      })
    }

    // Return only what the widget needs
    // Never expose system_prompt to client side
    return res.status(200).json({
      agentId: (agent as any).id,
      name: (agent as any).name,
      welcomeMessage: (agent as any).welcome_message,
      quickPrompts: (agent as any).quick_prompts || [],
      leadField: (agent as any).lead_field,
      leadMessage: (agent as any).lead_message,
      escalationTriggers: (agent as any).escalation_triggers || [],
      widgetColor: (agent as any).widget_color || '#6366f1',
      widgetPosition: (agent as any).widget_position || 'bottom-right',
      industry: (agent.clients as any)?.industry || '',
      businessName: (agent.clients as any)?.business_name || '',
    })
  } catch (err) {
    console.error('[/api/widget/config]', err)
    return res.status(500).json({ error: 'Failed to fetch config' })
  }
}
