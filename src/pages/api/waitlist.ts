import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { authRateLimiter, getClientIP } from '@/lib/rate-limiter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit — max 3 submissions per 15 min per IP
  const ip = getClientIP(req)
  try {
    await authRateLimiter.consume(ip)
  } catch {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const { email, businessName, businessType, message, source } = req.body

  // Validate email
  if (!email || !email.includes('@') || email.length > 254) {
    return res.status(400).json({ error: 'Valid email is required' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        business_name: businessName || null,
        business_type: businessType || null,
        message: message || null,
        source: source || 'website'
      })
      .select('position')
      .single()

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        return res.status(200).json({
          success: true,
          message: "You're already on the waitlist! We'll be in touch soon.",
          position: null
        })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      message: "You're on the waitlist!",
      position: data.position
    })
  } catch (err) {
    console.error('[/api/waitlist] Error:', err)
    return res.status(500).json({ error: 'Failed to join waitlist' })
  }
}
