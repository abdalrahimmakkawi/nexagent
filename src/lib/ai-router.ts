// src/lib/ai-router.ts
// ─────────────────────────────────────────────────────────────
// NexAgent AI Router
// Uses NVIDIA API (primary) with DeepSeek fallback
// ─────────────────────────────────────────────────────────────

import { aiClient, aiModel, providerName } from './nvidia-client'

// ── Types ─────────────────────────────────────────────────────
export type AIProvider = 'nvidia' | 'deepseek'

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
    const response = await aiClient.chat.completions.create({
      model: aiModel,
      max_tokens: config.maxTokens || 1024,
      messages: [
        { role: 'system', content: config.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
    })

    const content = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return {
      content,
      provider: providerName,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    console.error(`[AI Router] ${providerName} API error:`, error)
    throw new Error(`Failed to get response from ${providerName} API. Please check your API key and configuration.`)
  }
}
