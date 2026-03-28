const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  experimental: {
    serverComponentsExternalPackages: [
      'openai',
      'rate-limiter-flexible',
    ]
  },
  
  images: {
    domains: ['nexagent-one.vercel.app'],
    formats: ['image/avif', 'image/webp'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] } 
      : false,
  },
  
  // Security headers for all pages
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      // Widget pages allow embedding from anywhere
      {
        source: '/widget/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
        ],
      },
      // API routes - strict CORS
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_SITE_URL || '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, x-nexagent-request, authorization'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Redirect HTTP to HTTPS in production
  async redirects() {
    return process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/:path*',
            has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
            destination: 'https://nexagent-one.vercel.app/:path*',
            permanent: true,
          },
        ]
      : []
  },
}

module.exports = nextConfig
