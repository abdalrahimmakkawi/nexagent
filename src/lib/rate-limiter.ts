import { RateLimiterMemory } from 'rate-limiter-flexible'

// Per-IP rate limiter for chat endpoint
// Max 20 requests per minute per IP
export const chatRateLimiter = new RateLimiterMemory({
  points: 20,        // requests allowed
  duration: 60,      // per 60 seconds
  blockDuration: 120 // block for 2 minutes if exceeded
})

// Stricter limiter for auth endpoints
// Max 5 attempts per 15 minutes per IP
export const authRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
  blockDuration: 900
})

// Daily limit per IP to protect DeepSeek API costs
// Max 100 messages per day per IP
export const dailyRateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 86400,
  blockDuration: 86400
})

export function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}
