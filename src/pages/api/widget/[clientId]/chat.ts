import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { chatRateLimiter, dailyRateLimiter, getClientIP } from '@/lib/rate-limiter'
import OpenAI from 'openai'

const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
})

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
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('system_prompt, status, clients(industry)')
      .eq('id', agentId)
      .eq('client_id', clientId)
      .single()

    if (!agent || agent.status !== 'active') {
      return res.status(403).json({ error: 'Agent not active' })
    }

    const start = Date.now()

    // Call DeepSeek with agent's actual system prompt
    const response = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: agent.system_prompt },
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
        await supabaseAdmin.from('messages').insert([
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
        await supabaseAdmin
          .from('conversations')
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
