import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
})

// Admin secret key for protection
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'nexagent-admin-2024'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check admin secret key
  const adminKey = req.headers['x-admin-key'] as string
  if (adminKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const { message, sessionId } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message required' })
  }

  try {
    // Fetch platform metrics for context
    const [
      { count: totalClients },
      { count: activeAgents },
      { count: pendingAgents },
      { count: totalLeads },
      { count: waitlistCount },
      clientsData,
      recentWaitlist,
      weeklyStats
    ] = await Promise.all([
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('clients').select('industry'),
      supabaseAdmin.from('waitlist').select('email, created_at').order('created_at', { ascending: false }).limit(5),
      // Get weekly stats
      Promise.resolve({
        leadsThisWeek: 12, // Mock for now, would calculate from actual data
        conversationsThisWeek: 45
      })
    ])

    // Extract industries
    const industries = Array.from(new Set(
      (clientsData?.data || [])
        .map((c: any) => c.industry)
        .filter(Boolean)
    ))

    const metrics = {
      totalClients: totalClients || 0,
      activeAgents: activeAgents || 0,
      pendingAgents: pendingAgents || 0,
      totalLeads: totalLeads || 0,
      leadsThisWeek: weeklyStats.leadsThisWeek,
      conversationsThisWeek: weeklyStats.conversationsThisWeek,
      waitlistCount: waitlistCount || 0,
      industries,
      recentWaitlist: recentWaitlist?.data || []
    }

    // Build system prompt with real data
    let systemPrompt = `You are the personal AI business advisor for the founder of NexAgent — an AI agent platform for SMB businesses.

CURRENT PLATFORM DATA (as of ${new Date().toISOString()}):
- Total registered clients: ${metrics.totalClients}
- Active agents deployed: ${metrics.activeAgents}
- Pending review: ${metrics.pendingAgents}
- Total leads captured: ${metrics.totalLeads}
- Leads this week: ${metrics.leadsThisWeek}
- Conversations this week: ${metrics.conversationsThisWeek}
- Waitlist signups: ${metrics.waitlistCount}
- Industries served: ${metrics.industries.join(', ')}

BUSINESS CONTEXT:
- Product: Custom AI support agents for SMBs
- Pricing: $499 one-time, $299/month Growth, $799/month Scale
- Stack: Next.js, Supabase, DeepSeek, Vercel, n8n
- Competitors: Intercom, Crisp, Glean, Tidio
- Positioning: Enterprise AI power at SMB prices
- Differentiators: 3-day setup, no IT needed, custom-built agents, collective brain learning

LIVE SITE: https://nexagent-one.vercel.app
GITHUB: https://github.com/abdalrahimmakkawi/nexagent

YOUR CAPABILITIES:
1. Analyze platform metrics and suggest actions
2. Write LinkedIn posts, Reddit posts, cold DMs
3. Suggest responses to difficult client situations
4. Competitive analysis and market strategy
5. Pricing strategy and upsell opportunities  
6. Technical advice on the codebase
7. Content calendar planning
8. Outreach message templates

Be direct, strategic, and data-driven. You have access to real platform data above. Use it.
Never be generic — always tie advice to NexAgent's specific situation.`

    // Handle special commands
    if (message.startsWith('/linkedin')) {
      const topic = message.replace('/linkedin', '').trim() || 'AI agent platform growth'
      systemPrompt += `\n\nGenerate a high-quality LinkedIn post about ${topic}. Format it exactly like this:
- Hook line (stops the scroll, no clickbait)
- 2-3 short paragraphs with line breaks
- Bullet points or arrows for key points
- Call to action with demo/waitlist link
- 5 relevant hashtags
- Tone: founder building in public, authentic, not salesy
- Include real numbers from the platform data above
- Max 1300 characters (LinkedIn limit)`
    } else if (message.startsWith('/reddit')) {
      const topic = message.replace('/reddit', '').trim() || 'AI agent platform'
      systemPrompt += `\n\nGenerate a Reddit post about ${topic}. Format it exactly like this:
- Catchy title (no clickbait, honest)
- 2-3 paragraphs with genuine insights
- Include real metrics/experience
- Ask for genuine discussion/advice
- Relevant subreddit (r/SaaS, r/startups, r/indiehackers, etc.)
- Tone: authentic founder sharing experience
- Include real numbers from platform data above`
    } else if (message.startsWith('/dm')) {
      const context = message.replace('/dm', '').trim() || 'potential client'
      systemPrompt += `\n\nGenerate a cold DM outreach message for ${context}. Format it exactly like this:
- Personalized opening (mention their work/company)
- 1-2 sentences about NexAgent value prop
- Specific benefit relevant to them
- Low-friction call to action
- Under 200 characters total
- No generic templates - use platform data to personalize
- Focus on solving their specific problem`
    } else if (message.startsWith('/email')) {
      const context = message.replace('/email', '').trim() || 'potential client'
      systemPrompt += `\n\nGenerate a cold email template for ${context}. Format it exactly like this:
- Personalized subject line
- Short, scannable paragraphs
- Include 1-2 real metrics from platform
- Clear value proposition
- Simple call to action
- Professional but conversational tone
- Under 150 words total`
    } else if (message.startsWith('/response')) {
      const context = message.replace('/response', '').trim() || 'client inquiry'
      systemPrompt += `\n\nGenerate a professional response to ${context}. Format it exactly like this:
- Acknowledge their question/concern
- Provide clear, helpful answer
- Include relevant platform capabilities
- Offer next steps or resources
- Professional but friendly tone
- Reference actual platform features/data`
    }

    const start = Date.now()

    // Call DeepSeek with enhanced system prompt
    const response = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
    })

    const content = response.choices[0]?.message?.content || 
      "I'm having trouble right now. Please try again!"
    const latencyMs = Date.now() - start

    return res.status(200).json({
      content,
      provider: 'deepseek',
      latencyMs,
      metrics: {
        clients: metrics.totalClients,
        activeAgents: metrics.activeAgents,
        leads: metrics.totalLeads
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown'
    console.error('[/api/admin/assistant]', message)
    return res.status(500).json({ 
      error: 'Service temporarily unavailable' 
    })
  }
}
