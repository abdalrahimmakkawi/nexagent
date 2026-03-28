import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { conversationId } = req.body

  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation ID required' })
  }

  try {
    // Update conversation with end time and summary
    const { data: conversation } = await (supabaseAdmin
      .from('conversations') as any)
      .update({
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select(`
        id,
        message_count,
        agent_id,
        client_id,
        messages(id, role, content, created_at)
      `)
      .single()

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // Generate conversation summary for analytics
    const messages = (conversation as any).messages || []
    const userMessages = messages.filter((m: any) => m.role === 'user')
    const aiMessages = messages.filter((m: any) => m.role === 'assistant')
    
    // Extract key insights (simple implementation)
    const userMessageTexts = userMessages.map((m: any) => m.content).join(' ')
    const commonWords = userMessageTexts.toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3)
      .reduce((acc: Record<string, number>, word: string) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})

    const topKeywords = Object.entries(commonWords)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([word]) => word)

    // Store conversation analytics
    await (supabaseAdmin
      .from('conversation_analytics') as any)
      .insert({
        conversation_id: conversationId,
        agent_id: (conversation as any).agent_id,
        client_id: (conversation as any).client_id,
        message_count: (conversation as any).message_count,
        user_message_count: userMessages.length,
        ai_message_count: aiMessages.length,
        duration_minutes: Math.floor(
          (new Date().getTime() - new Date((conversation as any).created_at).getTime()) / 60000
        ),
        top_keywords: topKeywords,
        source: 'widget',
        ended_at: new Date().toISOString()
      })

    return res.status(200).json({ 
      success: true,
      message: 'Conversation ended successfully',
      analytics: {
        messageCount: (conversation as any).message_count,
        duration: 'Calculated',
        topKeywords
      }
    })

  } catch (err) {
    console.error('[/api/conversations/end]', err)
    return res.status(500).json({ error: 'Failed to end conversation' })
  }
}
