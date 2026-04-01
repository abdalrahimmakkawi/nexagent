import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const testId = randomUUID()
  const results: any = {}

  try {
    console.log('[SIMPLE_TEST] Starting database test...')
    
    // Simple test: count existing records
    const { count: existingClients } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
    
    const { count: existingAgents } = await supabaseAdmin
      .from('agents')
      .select('*', { count: 'exact', head: true })

    console.log('[SIMPLE_TEST] Existing records:', { existingClients, existingAgents })

    // Test 1: Simple client insert
    console.log('[SIMPLE_TEST] Inserting client with ID:', testId)
    
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        id: testId,
        email: 'test@example.com',
        business_name: 'Test Business',
        business_type: 'Education',
        status: 'pending',
        plan: 'none',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('[SIMPLE_TEST] Client result:', { client, error: clientError })

    if (clientError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Client insert failed', 
        details: clientError 
      })
    }

    // Test 2: Simple agent insert
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        client_id: testId,
        name: 'Test Agent',
        store_id: 'test-store',
        system_prompt: 'Test system prompt',
        welcome_message: 'Welcome!',
        status: 'pending_review',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('[SIMPLE_TEST] Agent result:', { agent, error: agentError })

    if (agentError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Agent insert failed', 
        details: agentError 
      })
    }

    // Test 3: Verify records exist
    const { count: finalClientCount } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
    
    const { count: finalAgentCount } = await supabaseAdmin
      .from('agents')
      .select('*', { count: 'exact', head: true })

    console.log('[SIMPLE_TEST] Final counts:', { finalClientCount, finalAgentCount })

    // Cleanup
    await supabaseAdmin.from('agents').delete().eq('client_id', testId)
    await supabaseAdmin.from('clients').delete().eq('id', testId)

    return res.status(200).json({
      success: true,
      message: 'Database operations completed successfully',
      results: {
        existingClients,
        existingAgents,
        clientCreated: !!client,
        agentCreated: !!agent,
        finalClientCount,
        finalAgentCount
      }
    })
  } catch (error) {
    console.error('[SIMPLE_TEST] Error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
