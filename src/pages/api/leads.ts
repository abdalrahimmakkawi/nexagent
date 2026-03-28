import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { fireWebhook } from '@/lib/webhooks'
import { authRateLimiter, getClientIP } from '@/lib/rate-limiter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  try {
    await authRateLimiter.consume(ip)
  } catch {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { value, fieldType, storeId, storeName } = req.body

  if (!value || !storeId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Save to Supabase leads table
    await ((supabaseAdmin.from('leads') as any).insert({
      value: value.trim().toLowerCase(),
      field_type: fieldType || 'email',
      agent_id: null,
      client_id: null,
    }))

    // Fire n8n webhook — non-blocking
    fireWebhook('webhook/lead-captured', {
      event: 'lead.captured',
      storeId,
      storeName,
      fieldType: fieldType || 'email',
      value: value.trim(),
      timestamp: new Date().toISOString(),
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[/api/leads]', err)
    return res.status(500).json({ error: 'Failed to save lead' })
  }
}
