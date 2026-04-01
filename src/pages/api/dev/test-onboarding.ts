import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-key'] !== 
      process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const testClientId = 'test-' + Date.now()
  const results: any = {}

  try {
    // Test 1: Create client
    console.log('[TEST_ONBOARDING] Creating test client...')
    const { data: client, error: clientError } = 
      await supabaseAdmin
        .from('clients')
        .insert({
          id: testClientId,
          email: 'test@nexagent.dev',
          business_name: 'Test School',
          business_type: 'Education',
          status: 'pending',
          plan: 'none'
        })
        .select()
        .single()
    
    results.clientCreated = !!client
    results.clientError = clientError?.message
    results.clientId = client?.id

    // Test 2: Create agent
    console.log('[TEST_ONBOARDING] Creating test agent...')
    const { data: agent, error: agentError } = 
      await supabaseAdmin
        .from('agents')
        .insert({
          client_id: testClientId,
          name: 'Test School Agent',
          store_id: 'school',
          system_prompt: 'Test prompt for school assistant',
          welcome_message: 'Welcome to our school!',
          status: 'pending_review'
        })
        .select()
        .single()
    
    results.agentCreated = !!agent
    results.agentError = agentError?.message
    results.agentId = agent?.id

    // Test 3: Verify both appear in database
    console.log('[TEST_ONBOARDING] Verifying database records...')
    const { count: clientCount } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
    
    const { count: agentCount } = await supabaseAdmin
      .from('agents')
      .select('*', { count: 'exact', head: true })

    results.totalClients = clientCount
    results.totalAgents = agentCount

    // Test 4: Check if our test records are visible
    const { data: testClient } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', testClientId)
      .single()

    const { data: testAgent } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('client_id', testClientId)
      .single()

    results.testClientVisible = !!testClient
    results.testAgentVisible = !!testAgent

    // Cleanup test data
    console.log('[TEST_ONBOARDING] Cleaning up test data...')
    await supabaseAdmin
      .from('agents')
      .delete()
      .eq('client_id', testClientId)
    
    await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', testClientId)

    const success = !clientError && !agentError && client && agent

    return res.status(200).json({
      success,
      results,
      message: success 
        ? 'Database writes working correctly' 
        : 'Database write FAILED — check errors',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[TEST_ONBOARDING] Test failed:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
