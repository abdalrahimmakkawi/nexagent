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

  try {
    // Check for all agents
    const { data: allAgents, error: allError } = await supabaseAdmin
      .from('agents')
      .select('*, clients(*)')
      .order('created_at', { ascending: false })

    if (allError) {
      return res.status(500).json({ error: 'Failed to fetch agents', details: allError })
    }

    // Check for school-related agents specifically
    const schoolAgents = allAgents?.filter((agent: any) => {
      const businessName = agent.clients?.business_name?.toLowerCase() || ''
      const agentName = agent.name?.toLowerCase() || ''
      const businessType = agent.clients?.business_type?.toLowerCase() || ''
      
      return businessName.includes('school') || 
             businessName.includes('education') ||
             businessName.includes('academy') ||
             businessName.includes('learning') ||
             businessName.includes('university') ||
             businessName.includes('college') ||
             agentName.includes('school') ||
             agentName.includes('education') ||
             agentName.includes('academy') ||
             agentName.includes('learning') ||
             businessType.includes('school') ||
             businessType.includes('education') ||
             businessType.includes('academy')
    }) || []

    // Check for pending agents
    const pendingAgents = allAgents?.filter((agent: any) => 
      agent.status === 'pending_review' || 
      agent.status === 'building' || 
      agent.status === 'generating'
    ) || []

    return res.status(200).json({
      totalAgents: allAgents?.length || 0,
      schoolAgents: schoolAgents.length,
      schoolAgentsDetails: schoolAgents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        businessName: agent.clients?.business_name,
        businessType: agent.clients?.business_type,
        createdAt: agent.created_at
      })),
      pendingAgents: pendingAgents.length,
      pendingAgentsDetails: pendingAgents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        businessName: agent.clients?.business_name,
        createdAt: agent.created_at
      })),
      allAgentsStatus: allAgents?.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        businessName: agent.clients?.business_name,
        businessType: agent.clients?.business_type,
        createdAt: agent.created_at
      })) || []
    })

  } catch (error) {
    console.error('[Check School Agents] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
