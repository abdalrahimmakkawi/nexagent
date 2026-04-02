import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { fireWebhook } from '@/lib/webhooks'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    })
  }

  // Verify admin via session token (not secret key)
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token' })
  }

  // Verify the token belongs to admin email
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: { user }, error: authError } = 
    await supabaseAuth.auth.getUser(token)
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'abdalrahimmakkawi@gmail.com'
  if (user.email !== adminEmail) {
    return res.status(403).json({ error: 'Not admin' })
  }

  // Admin verified — proceed with approval
  const { agentId } = req.body

  if (!agentId) {
    return res.status(400).json({ 
      error: 'agentId required' 
    })
  }

  try {
    // Get agent details
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('*, clients(*)')
      .eq('id', agentId)
      .single() as any

    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found' 
      })
    }

    // Update agent to active
    await supabaseAdmin
      .from('agents')
      .update({ 
        status: 'active',
        approved_by: 'admin',
      } as any)
      .eq('id', agentId)

    // Update client approved status
    await supabaseAdmin
      .from('clients')
      .update({
        agent_approved: true,
        approved_at: new Date().toISOString(),
      } as any)
      .eq('id', agent.client_id)

    // Fire n8n notification
    try {
      fireWebhook('webhook/agent-approved', {
        event: 'agent.approved' as any,
        clientEmail: agent.clients?.email || '',
        clientName: agent.clients?.business_name || '',
        agentName: agent.name,
        agentId: agent.id,
        widgetUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/widget/${agent.client_id}`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        timestamp: new Date().toISOString(),
      })
    } catch {
      // Non-blocking
    }

    return res.status(200).json({ 
      success: true,
      message: 'Agent approved successfully'
    })

  } catch (err) {
    console.error('[/api/admin/approve-agent]', err)
    return res.status(500).json({ 
      error: 'Failed to approve agent' 
    })
  }
}
