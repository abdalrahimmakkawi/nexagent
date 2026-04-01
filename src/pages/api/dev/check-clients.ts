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
    // Check for all clients
    const { data: allClients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) {
      return res.status(500).json({ error: 'Failed to fetch clients', details: clientsError })
    }

    // Check for school-related clients specifically
    const schoolClients = allClients?.filter((client: any) => {
      const businessName = client.business_name?.toLowerCase() || ''
      const businessType = client.business_type?.toLowerCase() || ''
      
      return businessName.includes('school') || 
             businessName.includes('education') ||
             businessName.includes('academy') ||
             businessName.includes('learning') ||
             businessName.includes('university') ||
             businessName.includes('college') ||
             businessType.includes('school') ||
             businessType.includes('education') ||
             businessType.includes('academy') ||
             businessType.includes('learning')
    }) || []

    return res.status(200).json({
      totalClients: allClients?.length || 0,
      schoolClients: schoolClients.length,
      schoolClientsDetails: schoolClients.map((client: any) => ({
        id: client.id,
        businessName: client.business_name,
        businessType: client.business_type,
        email: client.email,
        plan: client.plan,
        agentStatus: client.agent_status,
        createdAt: client.created_at
      })),
      allClientsDetails: allClients?.map((client: any) => ({
        id: client.id,
        businessName: client.business_name,
        businessType: client.business_type,
        email: client.email,
        plan: client.plan,
        agentStatus: client.agent_status,
        createdAt: client.created_at
      })) || []
    })

  } catch (error) {
    console.error('[Check Clients] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
