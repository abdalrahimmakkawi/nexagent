// src/hooks/useChat.ts
import { useState, useCallback } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  provider?: 'claude' | 'gemini'
  latencyMs?: number
  timestamp: Date
}

interface UseChatOptions {
  storeId: string
  routingMode?: 'auto' | 'claude' | 'gemini'
}

export function useChat({ storeId, routingMode = 'auto' }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalMessages, setTotalMessages] = useState(0)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)
    setError(null)
    setTotalMessages(prev => prev + 1)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          storeId,
          routingMode,
        }),
      })

      if (res.status === 429) {
        const data = await res.json()
        const rateLimitMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.error || '⚠️ You\'ve sent a lot of messages! Please wait a moment before continuing.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, rateLimitMsg])
        return
      }

      if (!res.ok) {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '⚠️ Service temporarily unavailable. Please try again.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMsg])
        return
      }

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        provider: data.provider,
        latencyMs: data.latencyMs,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
      setTotalMessages(prev => prev + 1)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, storeId, routingMode, loading])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
    setTotalMessages(0)
  }, [])

  return { messages, loading, error, sendMessage, reset, totalMessages }
}
