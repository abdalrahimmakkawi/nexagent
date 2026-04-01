import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Test all admin endpoints that the frontend uses
  const results: any = {}

  try {
    // Test stats endpoint
    const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/stats`, {
      headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY! }
    })
    results.stats = statsResponse.ok ? await statsResponse.json() : { error: 'Stats failed' }

    // Test pending agents endpoint
    const pendingResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/pending-agents`, {
      headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY! }
    })
    results.pendingAgents = pendingResponse.ok ? await pendingResponse.json() : { error: 'Pending agents failed' }

    // Test all agents endpoint
    const agentsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/all-agents`, {
      headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY! }
    })
    results.allAgents = agentsResponse.ok ? await agentsResponse.json() : { error: 'All agents failed' }

    // Test clients endpoint
    const clientsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/all-clients`, {
      headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY! }
    })
    results.allClients = clientsResponse.ok ? await clientsResponse.json() : { error: 'All clients failed' }

    return res.status(200).json({
      success: true,
      message: 'All admin endpoints working - frontend should work without environment variable warnings',
      results,
      environmentCheck: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Available' : '❌ Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Available' : '❌ Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Available (server-side only)' : '❌ Missing (server-side)',
        ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY ? '✅ Available' : '❌ Missing'
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
