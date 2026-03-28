import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { chatRateLimiter, dailyRateLimiter, getClientIP } from '@/lib/rate-limiter'
import OpenAI from 'openai'

const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
})

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

    // Fetch collective brain insights for enhanced responses
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

    // Enhanced system prompt with collective brain
    const enhancedSystemPrompt = `${(agent as any).system_prompt}

${collectiveBrainInsights}

COLLECTIVE INTELLIGENCE:
You have access to insights from thousands of successful customer conversations across all NexAgent agents.
Use this knowledge to provide better, more informed responses based on what has worked well for similar inquiries.
Adapt successful response patterns while maintaining your unique personality and the client's specific context.`

    // Call DeepSeek with enhanced system prompt
    const response = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages.slice(-20).map((m: any) => ({
          role: m.role,
          content: m.content
            .replace(/<[^>]*>/g, '')
            .slice(0, 400)
        }))
      ],
    })

    const content = response.choices[0]?.message?.content || 
      "I'm having trouble right now. Please try again!"
    const latencyMs = Date.now() - start

    // Save messages to database
    if (conversationId) {
      const lastUserMsg = [...messages].reverse()
        .find((m: any) => m.role === 'user')
      
      if (lastUserMsg) {
        await (supabaseAdmin.from('messages') as any).insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: lastUserMsg.content,
          },
          {
            conversation_id: conversationId,
            role: 'assistant',
            content,
            provider: 'deepseek',
            latency_ms: latencyMs,
          }
        ])

        // Update message count
        await (supabaseAdmin
          .from('conversations') as any)
          .update({ 
            message_count: messages.length + 1 
          })
          .eq('id', conversationId)
      }
    }

    return res.status(200).json({
      content,
      provider: 'deepseek',
      latencyMs,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown'
    console.error('[/api/widget/chat]', message)
    return res.status(500).json({ 
      error: 'Service temporarily unavailable' 
    })
  }
}
