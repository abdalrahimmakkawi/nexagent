import { NextApiRequest } from 'next'
import { supabaseAdmin } from './supabase'

type SecurityEvent =
  | 'BLOCKED_BOT'
  | 'SUSPICIOUS_PATH'
  | 'RATE_LIMIT_HIT'
  | 'BRUTE_FORCE'
  | 'MALICIOUS_INPUT'
  | 'UNAUTHORIZED_ADMIN'
  | 'CSRF_VIOLATION'
  | 'IP_BLOCKED'

interface SecurityLog {
  event: SecurityEvent
  ip: string
  path?: string
  userAgent?: string
  details?: string
  timestamp: string
}

// In production this would write to a database.
// For now it logs to console with structured format
// that Vercel captures in its log system.

export async function logSecurityEvent(
  log: SecurityLog
): Promise<void> {
  // Always log to console
  console.warn(`[SECURITY_EVENT] ${JSON.stringify(log)}`)
  
  // Also persist to database
  try {
    await (supabaseAdmin.from('security_logs') as any).insert({
      event: log.event,
      ip: log.ip,
      path: log.path,
      user_agent: log.userAgent,
      details: log.details,
    })
  } catch {
    // Never let logging crash the app
  }
}

// Helper function to get IP from request
export function getIPFromRequest(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string | undefined
  const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return (
    forwardedStr?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}
