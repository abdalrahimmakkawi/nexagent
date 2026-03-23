// src/pages/api/chat.ts
// ─────────────────────────────────────────────────────────────
// POST /api/chat
// Body: { messages, storeId }
// Returns: { content, provider, latencyMs }
// ─────────────────────────────────────────────────────────────

import type { NextApiRequest, NextApiResponse } from 'next'
import { chat, Message } from '@/lib/ai-router'
import { getStoreConfig } from '@/lib/store-configs'
import { chatRateLimiter, dailyRateLimiter, getClientIP } from '@/lib/rate-limiter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  const ip = getClientIP(req)

  // Check per-minute rate limit
  try {
    await chatRateLimiter.consume(ip)
  } catch {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: 120
    })
  }

  // Check daily rate limit
  try {
    await dailyRateLimiter.consume(ip)
  } catch {
    return res.status(429).json({
      error: 'Daily message limit reached. Please try again tomorrow.',
      retryAfter: 86400
    })
  }

  const { messages, storeId } = req.body as {
    messages: Message[]
    storeId: string
  }

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  // Limit conversation length to prevent abuse
  if (messages.length > 50) {
    return res.status(400).json({ error: 'Conversation too long' })
  }

  // Validate message content length
  const lastMessage = messages[messages.length - 1]
  if (!lastMessage?.content || lastMessage.content.length > 400) {
    return res.status(400).json({ error: 'Message too long. Max 400 characters.' })
  }

  // Sanitize: strip any HTML or script tags from input
  const sanitized = messages.map(m => ({
    ...m,
    content: m.content
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .trim()
  }))

  const store = getStoreConfig(storeId || 'fashion')

  try {
    const response = await chat(sanitized, {
      systemPrompt: store.systemPrompt,
      maxTokens: 1024,
    })
    return res.status(200).json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/chat] Error:', message)
    // Never expose internal error details to client
    return res.status(500).json({ error: 'Service temporarily unavailable' })
  }
}
