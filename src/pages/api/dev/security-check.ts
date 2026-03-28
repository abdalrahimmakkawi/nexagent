export default function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' })
  }
  
  const checks = {
    deepseekKey: !!process.env.DEEPSEEK_API_KEY,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    adminEmail: !!process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    adminSecret: !!process.env.ADMIN_SECRET_KEY,
    n8nWebhook: !!process.env.N8N_WEBHOOK_BASE_URL,
    statsSecret: !!process.env.STATS_SECRET_KEY,
    nextauthSecret: !!process.env.NEXTAUTH_SECRET,
  }

  const allPassed = Object.values(checks).every(Boolean)
  
  return res.status(200).json({
    status: allPassed ? 'SECURE' : 'ISSUES_FOUND',
    checks,
    timestamp: new Date().toISOString(),
  })
}
