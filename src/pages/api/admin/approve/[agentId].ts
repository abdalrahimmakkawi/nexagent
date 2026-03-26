import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { fireWebhook } from '@/lib/webhooks'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple admin protection
  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { agentId } = req.query as { agentId: string }

  try {
    // Get agent + client info
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('*, clients(*)')
      .eq('id', agentId)
      .single()

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Update agent status to active
    await supabaseAdmin
      .from('agents')
      .update({
        status: 'active',
        approved_by: 'admin',
      })
      .eq('id', agentId)

    // Update client approved status
    await supabaseAdmin
      .from('clients')
      .update({
        agent_approved: true,
        approved_at: new Date().toISOString(),
      })
      .eq('id', agent.client_id)

    // Notify client via n8n
    fireWebhook('webhook/agent-approved', {
      event: 'agent.approved',
      clientEmail: agent.clients.email,
      clientName: agent.clients.business_name,
      agentName: agent.name,
      agentId: agent.id,
      widgetUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/widget/${agent.client_id}`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      timestamp: new Date().toISOString(),
    })

    return res.status(200).json({ 
      success: true,
      message: 'Agent approved and client notified'
    })

  } catch (err) {
    console.error('[/api/admin/approve]', err)
    return res.status(500).json({ error: 'Failed to approve agent' })
  }
}
