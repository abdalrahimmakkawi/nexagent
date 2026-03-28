import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BLOCKED_USER_AGENTS = [
  'sqlmap', 'nikto', 'nmap', 'masscan',
  'scrapy', 'zgrab', 'nuclei',
]

const SUSPICIOUS_PATHS = [
  '/wp-admin', '/wp-login', '/.env',
  '/phpmyadmin', '/.git',
  '/shell.php', '/cmd',
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''

  // Bot detection
  const isBlockedBot = BLOCKED_USER_AGENTS.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )
  if (isBlockedBot) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Suspicious path detection
  const isSuspiciousPath = SUSPICIOUS_PATHS.some(pattern =>
    pathname.toLowerCase().includes(pattern.toLowerCase())
  )
  if (isSuspiciousPath) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://api.deepseek.com https://api.stripe.com https://*.railway.app",
    "frame-src 'self' https://js.stripe.com https://nexagent-one.vercel.app",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https: http:",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  // Widget pages can be embedded anywhere
  if (pathname.startsWith('/widget/')) {
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set(
      'Content-Security-Policy',
      csp.replace(
        "frame-ancestors 'self' https: http:",
        "frame-ancestors *"
      )
    )
  }

  // DO NOT do any auth checks in middleware
  // Let each page handle its own auth check
  // This prevents redirect loops

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|widget.js).*)',
  ],
}
