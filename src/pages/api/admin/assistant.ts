import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { aiClient, aiModel, providerName } from '@/lib/nvidia-client'
import { cleanAIResponse } from '@/lib/ai-utils'

// Admin secret key for protection
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'nexagent-admin-2024'

function formatCollectiveBrainInsights(learningData: any, insights: string[]): string {
  if (!learningData || insights.length === 0) {
    return ""
  }

  let formatted = "COLLECTIVE BRAIN INSIGHTS:\n\n"
  
  // Add common questions and effective responses
  if (learningData.commonQuestions && learningData.commonQuestions.length > 0) {
    formatted += "Common Customer Questions:\n"
    learningData.commonQuestions.slice(0, 5).forEach((q: any, index: number) => {
      formatted += `${index + 1}. ${q.question.replace('_', ' ')} (asked ${q.frequency} times)\n`
    })
    formatted += "\n"
  }

  // Add effective response patterns
  if (learningData.effectiveResponses && learningData.effectiveResponses.length > 0) {
    formatted += "High-Performing Response Patterns:\n"
    learningData.effectiveResponses.slice(0, 3).forEach((response: any, index: number) => {
      formatted += `${index + 1}. ${response.context}...\n`
    })
    formatted += "\n"
  }

  // Add industry insights if available
  if (learningData.industryInsights && Object.keys(learningData.industryInsights).length > 0) {
    formatted += "Industry-Specific Insights:\n"
    Object.entries(learningData.industryInsights).slice(0, 3).forEach(([industry, data]: [string, any]) => {
      formatted += `- ${industry}: ${data.conversationCount} successful conversations\n`
    })
    formatted += "\n"
  }

  // Add general insights
  if (insights.length > 0) {
    formatted += "Key Learnings:\n"
    insights.slice(0, 3).forEach((insight, index) => {
      formatted += `${index + 1}. ${insight}\n`
    })
  }

  return formatted
}

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

  // Fetch conversation history if sessionId provided
  let conversationHistory = []
  if (sessionId) {
    const { data: history } = await supabaseAdmin
      .from('admin_conversations')
        .select('messages')
        .eq('id', sessionId)
        .single()
    conversationHistory = history?.messages || []
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
      (supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }) as any),
      (supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active') as any),
      (supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending_review') as any),
      (supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }) as any),
      (supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }) as any),
      (supabaseAdmin.from('clients').select('industry') as any),
      (supabaseAdmin.from('waitlist').select('email, created_at').order('created_at', { ascending: false }).limit(5) as any),
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

    // Fetch collective brain insights
    let collectiveBrainInsights = ""
    try {
      const brainResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/collective-brain`)
      if (brainResponse.ok) {
        const brainData = await brainResponse.json()
        collectiveBrainInsights = formatCollectiveBrainInsights(brainData.learningData, brainData.insights)
      }
    } catch (error) {
      console.log('Failed to fetch collective brain data:', error)
    }

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

${collectiveBrainInsights}

YOUR CAPABILITIES:
1. Analyze platform metrics and suggest actions
2. Write LinkedIn posts, Reddit posts, cold DMs
3. Suggest responses to difficult client situations
4. Competitive analysis and market strategy
5. Pricing strategy and upsell opportunities  
6. Technical advice on the codebase
7. Content calendar planning
8. Outreach message templates

Be direct, strategic, and data-driven. You have access to real platform data and collective intelligence from thousands of customer conversations above. Use it.
Never be generic — always tie advice to NexAgent's specific situation and real performance data.`

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

    // Call AI with enhanced system prompt
    const response = await aiClient.chat.completions.create({
      model: aiModel,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
    })

    const content = cleanAIResponse(
      response.choices[0]?.message?.content || 
      "I'm having trouble right now. Please try again!"
    )
    const latencyMs = Date.now() - start

    return res.status(200).json({
      content,
      provider: providerName,
      latencyMs,
      metrics: {
        clients: metrics.totalClients,
        activeAgents: metrics.activeAgents,
        leads: metrics.totalLeads
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown'
    console.error('[/api/admin/assistant] Full error details:', {
      error: message,
      stack: err instanceof Error ? err.stack : 'No stack available',
      timestamp: new Date().toISOString(),
      apiEndpoint: 'nvidia',
      model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-4-340b-instruct'
    })
    return res.status(500).json({ 
      error: 'Service temporarily unavailable' 
    })
  }
}
