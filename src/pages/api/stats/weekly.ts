import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Protect with a simple secret key
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.STATS_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekStr = oneWeekAgo.toISOString()

    // Leads this week
    const { count: leadsThisWeek } = await (supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStr) as any)

    // Waitlist this week
    const { count: waitlistThisWeek } = await (supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStr) as any)

    // Total waitlist
    const { count: totalWaitlist } = await (supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true }) as any)

    // Total leads all time
    const { count: totalLeads } = await (supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true }) as any)

    return res.status(200).json({
      week: {
        leads: leadsThisWeek || 0,
        waitlistSignups: waitlistThisWeek || 0,
      },
      allTime: {
        leads: totalLeads || 0,
        waitlist: totalWaitlist || 0,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[/api/stats/weekly]', err)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
}
