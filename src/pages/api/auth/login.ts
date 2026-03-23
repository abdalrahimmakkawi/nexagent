import type { NextApiRequest, NextApiResponse } from 'next'
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
    return res.status(429).json({
      error: 'Too many login attempts. Please wait 15 minutes.',
      retryAfter: 900
    })
  }

  return res.status(200).json({ ok: true })
}
