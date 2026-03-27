import { RateLimiterMemory } from 'rate-limiter-flexible'

// Very conservative per-IP rate limiter for DeepSeek API
// Max 5 requests per minute per IP (reduced from 20)
export const chatRateLimiter = new RateLimiterMemory({
  points: 5,         // requests allowed (reduced from 20)
  duration: 60,      // per 60 seconds
  blockDuration: 300 // block for 5 minutes if exceeded (increased from 2)
})

// Stricter limiter for auth endpoints
// Max 5 attempts per 15 minutes per IP
export const authRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
  blockDuration: 900
})

// Very strict daily limit per IP to protect DeepSeek API costs
// Max 30 messages per day per IP (reduced from 100)
export const dailyRateLimiter = new RateLimiterMemory({
  points: 30,        // reduced from 100
  duration: 86400,   // 24 hours
  blockDuration: 86400
})

// New: Global rate limiter for all DeepSeek API calls
// Max 100 requests per minute across all users
export const globalRateLimiter = new RateLimiterMemory({
  points: 100,       // total requests per minute
  duration: 60,      // per 60 seconds
  blockDuration: 60   // block for 1 minute if exceeded
})

// New: Smart onboarding rate limiter (more restrictive)
// Max 3 onboarding sessions per hour per IP
export const onboardingRateLimiter = new RateLimiterMemory({
  points: 3,         // onboarding sessions allowed
  duration: 3600,    // per hour
  blockDuration: 1800 // block for 30 minutes if exceeded
})

// New: Token-based rate limiting for API costs
// Max 1000 tokens per minute per IP
export const tokenRateLimiter = new RateLimiterMemory({
  points: 1000,      // tokens allowed per minute
  duration: 60,      // per 60 seconds
  blockDuration: 300 // block for 5 minutes if exceeded
})

export function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}

// New: Function to estimate tokens in a message
export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// New: Check if user has exceeded token limits
export async function checkTokenLimit(ip: string, message: string): Promise<boolean> {
  const tokens = estimateTokens(message)
  try {
    await tokenRateLimiter.consume(ip, tokens)
    return true
  } catch {
    return false
  }
}
