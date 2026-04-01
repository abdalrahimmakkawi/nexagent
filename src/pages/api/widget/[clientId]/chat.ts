import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { chatRateLimiter, dailyRateLimiter, getClientIP } from '@/lib/rate-limiter'
import { multiAgentChat, PLAN_AGENTS, AgentContext } from '@/lib/multi-agent'
import { providerName } from '@/lib/nvidia-client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  
  try {
    await chatRateLimiter.consume(ip)
    await dailyRateLimiter.consume(ip)
  } catch {
    return res.status(429).json({ 
      error: 'Too many messages. Please wait.' 
    })
  }

  const { 
    clientId, agentId, messages, 
    sessionId, conversationId 
  } = req.body

  if (!clientId || !messages || !agentId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Fetch agent system prompt server-side
    const { data: agent } = await (supabaseAdmin
      .from('agents') as any)
      .select('system_prompt, status, clients(industry)')
      .eq('id', agentId)
      .eq('client_id', clientId)
      .single()

    if (!agent || (agent as any).status !== 'active') {
      return res.status(403).json({ error: 'Agent not active' })
    }

    const start = Date.now()

    // Get client's plan to determine active agents
    const { data: teamData } = await supabaseAdmin
      .from('agent_teams')
      .select('plan, active_agents')
      .eq('client_id', clientId)
      .single() as any

    const plan = (teamData as any)?.plan || 'starter'
    const activeAgents = (teamData as any)?.active_agents 
      || PLAN_AGENTS[plan]

    // Build agent context
    const agentContext: AgentContext = {
      businessName: (agent as any)?.clients?.business_name 
        || 'Our Business',
      industry: (agent as any)?.clients?.industry || '',
      systemPrompt: (agent as any).system_prompt,
      activeAgents,
      conversationHistory: messages.slice(-10),
    }

    // Run multi-agent system
    const result = await multiAgentChat(
      messages[messages.length - 1].content,
      agentContext,
      conversationId
    )

    // Save messages to database
    if (conversationId) {
      const lastUserMsg = [...messages].reverse()
        .find((m: any) => m.role === 'user')
      
      if (lastUserMsg) {
        await ((supabaseAdmin.from('messages') as any).insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: lastUserMsg.content,
            created_at: new Date().toISOString()
          }
        ]))
      }

      // Update message count
      await ((supabaseAdmin
          .from('conversations') as any)
          .update({ 
            message_count: messages.length + 1 
          }))
          .eq('id', conversationId)
      }

    return res.status(200).json({
      content: result.content,
      provider: providerName,
      agentUsed: result.agentUsed,
      sentiment: result.decision.sentiment,
      intent: result.decision.intent,
      latencyMs: result.latencyMs,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown'
    console.error('[/api/widget/chat]', message)
    return res.status(500).json({ 
      error: 'Service temporarily unavailable' 
    })
  }
}
