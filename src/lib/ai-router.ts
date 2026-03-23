// src/lib/ai-router.ts
// ─────────────────────────────────────────────────────────────
// NexAgent AI Router
// Uses DeepSeek API (OpenAI-compatible) for all queries
// ─────────────────────────────────────────────────────────────

import OpenAI from 'openai'

// Validate required env vars at startup
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

if (!DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY environment variable is required')
}

// ── Client ──────────────────────────────────────────────────
const openai = new OpenAI({
  baseURL: DEEPSEEK_BASE_URL,
  apiKey: DEEPSEEK_API_KEY,
})

// ── Types ─────────────────────────────────────────────────────
export type AIProvider = 'deepseek'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentConfig {
  systemPrompt: string
  storeContext?: string
  maxTokens?: number
}

export interface AIResponse {
  content: string
  provider: AIProvider
  latencyMs: number
}

// ── Main Export ───────────────────────────────────────────────
export async function chat(
  messages: Message[],
  config: AgentConfig
): Promise<AIResponse> {
  const start = Date.now()

  try {
    const response = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      max_tokens: config.maxTokens || 1024,
      messages: [
        { role: 'system', content: config.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
    })

    const content = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return {
      content,
      provider: 'deepseek',
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    console.error('[AI Router] DeepSeek API error:', error)
    throw new Error('Failed to get response from DeepSeek API. Please check your API key and configuration.')
  }
}
