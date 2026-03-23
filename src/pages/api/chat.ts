// src/pages/api/chat.ts
// ─────────────────────────────────────────────────────────────
// POST /api/chat
// Body: { messages, storeId }
// Returns: { content, provider, latencyMs }
// ─────────────────────────────────────────────────────────────

import type { NextApiRequest, NextApiResponse } from 'next'
import { chat, Message } from '@/lib/ai-router'
import { getStoreConfig } from '@/lib/store-configs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, storeId } = req.body as {
    messages: Message[]
    storeId: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const store = getStoreConfig(storeId || 'fashion')

  try {
    const response = await chat(messages, {
      systemPrompt: store.systemPrompt,
      maxTokens: 1024,
    })

    return res.status(200).json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/chat] Error:', message)
    return res.status(500).json({ error: 'AI service unavailable', detail: message })
  }
}
