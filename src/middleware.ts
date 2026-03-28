import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Blocked user agents (bots, scrapers, scanners)
const BLOCKED_USER_AGENTS = [
  'sqlmap', 'nikto', 'nmap', 'masscan',
  'python-requests', 'go-http-client',
  'curl/', 'wget/', 'libwww-perl',
  'scrapy', 'zgrab', 'nuclei',
]

// Suspicious path patterns (attack attempts)
const SUSPICIOUS_PATHS = [
  '/wp-admin', '/wp-login', '/.env',
  '/phpmyadmin', '/admin.php', '/.git',
  '/config.php', '/shell.php', '/cmd',
  '/../', '/etc/passwd', '/proc/self',
  'UNION SELECT', 'DROP TABLE',
  '<script>', 'javascript:',
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
    || request.headers.get('x-real-ip')
    || 'unknown'

  // ── BOT & SCANNER DETECTION ──────────────────
  const isBlockedBot = BLOCKED_USER_AGENTS.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )
  if (isBlockedBot) {
    console.warn(`[Security] Blocked bot: ${userAgent} from ${ip}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── SUSPICIOUS PATH DETECTION ─────────────────
  const isSuspiciousPath = SUSPICIOUS_PATHS.some(pattern =>
    pathname.toLowerCase().includes(pattern.toLowerCase()) ||
    request.nextUrl.search.toLowerCase()
      .includes(pattern.toLowerCase())
  )
  if (isSuspiciousPath) {
    console.warn(`[Security] Suspicious path: ${pathname} from ${ip}`)
    return new NextResponse('Not Found', { status: 404 })
  }

  // ── ADMIN ROUTE PROTECTION ────────────────────
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(
      'sb-sheokyflemhabeurmpvm-auth-token'
    )
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── SECURITY HEADERS (ALL PAGES) ─────────────
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // ── CONTENT SECURITY POLICY ───────────────────
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "frame-src 'self' https://js.stripe.com https://nexagent-one.vercel.app",
    "connect-src 'self' https://*.supabase.co https://api.deepseek.com https://api.stripe.com https://*.railway.app",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https: http:",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Powered-By', '')

  // ── WIDGET IFRAME SECURITY ────────────────────
  // Widget pages can be embedded anywhere
  // Override X-Frame-Options for widget routes only
  if (pathname.startsWith('/widget/')) {
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set(
      'Content-Security-Policy',
      csp.replace("frame-ancestors 'self' https: http:", 
        "frame-ancestors *")
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|widget.js).*)',
  ],
}
