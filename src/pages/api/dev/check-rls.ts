import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('[RLS_CHECK] Checking RLS policies...')
    
    // Test 1: Try to read RLS policies
    const { data: policies, error: policyError } = await supabaseAdmin
      .rpc('get_policies', {
        schema: 'public',
        table_names: ['clients', 'agents', 'onboarding_submissions']
      })

    console.log('[RLS_CHECK] Policies:', policies)
    console.log('[RLS_CHECK] Policy error:', policyError)

    // Test 2: Try to bypass RLS with service role
    const { data: testInsert, error: testError } = await supabaseAdmin
      .from('clients')
      .insert({
        id: 'test-rls-' + Date.now(),
        email: 'test@nexagent.dev',
        business_name: 'Test RLS Check',
        business_type: 'Education',
        status: 'pending',
        plan: 'none'
      })
      .select()
      .single()

    console.log('[RLS_CHECK] Test insert result:', testInsert)
    console.log('[RLS_CHECK] Test insert error:', testError)

    // Test 3: Check if we can read the inserted record
    if (testInsert) {
      const { data: readBack, error: readError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', testInsert.id)
        .single()

      console.log('[RLS_CHECK] Read back result:', readBack)
      console.log('[RLS_CHECK] Read back error:', readError)

      // Cleanup
      await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', testInsert.id)
    }

    return res.status(200).json({
      success: !testError,
      message: testError ? 'RLS policy blocking inserts' : 'Inserts working',
      policies: policies || [],
      testInsert: !!testInsert,
      testError: testError?.message || null
    })

  } catch (error) {
    console.error('[RLS_CHECK] Error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'RLS check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
