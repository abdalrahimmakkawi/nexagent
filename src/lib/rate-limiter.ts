import { RateLimiterMemory } from 'rate-limiter-flexible'

// Chat endpoint — 20 req/min, 100/day per IP
export const chatRateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
  blockDuration: 120,
})

export const dailyRateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 86400,
  blockDuration: 86400,
})

// Auth — 5 attempts per 15 min per IP
export const authRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
  blockDuration: 1800,
})

// Admin routes — 3 attempts per 15 min per IP
export const adminRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 900,
  blockDuration: 3600,
})

// Onboarding — 3 submissions per hour per IP
export const onboardingRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 3600,
  blockDuration: 3600,
})

// Waitlist — 2 submissions per hour per IP
export const waitlistRateLimiter = new RateLimiterMemory({
  points: 2,
  duration: 3600,
  blockDuration: 7200,
})

// Suspicious IP tracker — blocks repeat offenders
export const suspiciousIPTracker = new RateLimiterMemory({
  points: 10,
  duration: 86400,
  blockDuration: 604800, // block for 1 week
})

export function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      'unknown'
  return ip
}

// Mark IP as suspicious
export async function markSuspicious(ip: string): Promise<void> {
  try {
    await suspiciousIPTracker.consume(ip)
  } catch {
    console.warn(`[Security] IP blocked for 1 week: ${ip}`)
  }
}

// Check if IP is currently blocked
export async function isBlocked(ip: string): Promise<boolean> {
  try {
    await suspiciousIPTracker.consume(ip, 0)
    return false
  } catch {
    return true
  }
}
