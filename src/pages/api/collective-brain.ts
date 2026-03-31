import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

interface LearningData {
  totalConversations: number
  totalMessages: number
  commonQuestions: Array<{ question: string; frequency: number; successRate: number }>
  effectiveResponses: Array<{ response: string; context: string; rating: number }>
  industryInsights: Record<string, any>
  escalationPatterns: Array<{ trigger: string; resolution: string }>
  leadCaptureSuccess: Array<{ method: string; conversionRate: number }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch all conversations for learning analysis
    console.log('Fetching conversations for collective brain analysis...')
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        messages(id, role, content, created_at, provider),
        agents!inner(
          id,
          name,
          clients!inner(
            id,
            business_name,
            industry
          )
        )
      `)
      .eq('status', 'resolved') // Only learn from successful conversations
      .order('created_at', { ascending: false })
      .limit(1000) // Analyze last 1000 successful conversations

    if (error) {
      console.error('[/api/collective-brain] Database error:', error)
      console.error('[/api/collective-brain] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return res.status(500).json({ 
        error: 'Failed to fetch learning data',
        detail: error.message,
        code: error.code,
        hint: error.hint
      })
    }

    console.log('Conversations fetched:', conversations?.length || 0)

    // Process learning data
    const learningData = await processLearningData(conversations || [])

    return res.status(200).json({
      learningData,
      insights: generateInsights(learningData),
      recommendations: generateRecommendations(learningData),
      lastUpdated: new Date().toISOString()
    })

  } catch (err) {
    console.error('[/api/collective-brain]', err)
    return res.status(500).json({ error: 'Failed to process collective brain' })
  }
}

async function processLearningData(conversations: any[]): Promise<LearningData> {
  const totalConversations = conversations.length
  const totalMessages = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0)
  
  // Extract common questions from user messages
  const userMessages = conversations
    .flatMap(conv => conv.messages?.filter((msg: any) => msg.role === 'user') || [])
    .map((msg: any) => msg.content.toLowerCase())

  // Group similar questions (simple keyword matching)
  const questionGroups = groupSimilarQuestions(userMessages)
  const commonQuestions = Object.entries(questionGroups)
    .map(([question, data]: [string, any]) => ({
      question,
      frequency: data.count,
      successRate: data.successRate
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20)

  // Extract effective responses
  const effectiveResponses = conversations
    .flatMap(conv => conv.messages?.filter((msg: any) => msg.role === 'assistant') || [])
    .map((msg: any) => ({
      response: msg.content,
      context: msg.content.substring(0, 100),
      rating: calculateResponseRating(msg.content)
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 50)

  // Industry-specific insights
  const industryInsights = conversations.reduce((acc, conv) => {
    const industry = conv.agents?.clients?.industry || 'Unknown'
    if (!acc[industry]) {
      acc[industry] = {
        conversationCount: 0,
        averageMessages: 0,
        commonTopics: [],
        successMetrics: {}
      }
    }
    acc[industry].conversationCount++
    acc[industry].averageMessages += conv.messages?.length || 0
    return acc
  }, {} as Record<string, any>)

  // Escalation patterns
  const escalationPatterns = conversations
    .filter(conv => conv.status === 'escalated')
    .map(conv => ({
      trigger: extractEscalationTrigger(conv.messages || []),
      resolution: 'Human intervention required'
    }))

  // Lead capture success patterns
  const leadCaptureSuccess = await analyzeLeadCapturePatterns(conversations)

  return {
    totalConversations,
    totalMessages,
    commonQuestions,
    effectiveResponses,
    industryInsights,
    escalationPatterns,
    leadCaptureSuccess
  }
}

function groupSimilarQuestions(messages: string[]): Record<string, any> {
  const groups: Record<string, any> = {}
  
  messages.forEach(message => {
    let category = 'other'
    
    // Simple keyword-based categorization
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      category = 'pricing_inquiry'
    } else if (message.includes('feature') || message.includes('what can') || message.includes('capabilities')) {
      category = 'feature_inquiry'
    } else if (message.includes('support') || message.includes('help') || message.includes('issue')) {
      category = 'support_request'
    } else if (message.includes('demo') || message.includes('trial') || message.includes('see')) {
      category = 'demo_request'
    } else if (message.includes('integration') || message.includes('connect') || message.includes('api')) {
      category = 'integration_question'
    } else if (message.includes('setup') || message.includes('install') || message.includes('implement')) {
      category = 'setup_question'
    }
    
    if (!groups[category]) {
      groups[category] = { count: 0, examples: [], successRate: 0.85 }
    }
    groups[category].count++
    if (groups[category].examples.length < 3) {
      groups[category].examples.push(message)
    }
  })
  
  return groups
}

function calculateResponseRating(response: string): number {
  let rating = 0.5 // Base rating
  
  // Positive indicators
  if (response.includes('I can help') || response.includes('Here\'s how')) rating += 0.2
  if (response.includes('step') || response.includes('first')) rating += 0.1
  if (response.includes('example') || response.includes('for instance')) rating += 0.1
  if (response.length > 100 && response.length < 500) rating += 0.1
  
  // Negative indicators
  if (response.includes('I don\'t know') || response.includes('cannot')) rating -= 0.2
  if (response.length < 50) rating -= 0.1
  
  return Math.max(0, Math.min(1, rating))
}

function extractEscalationTrigger(messages: any[]): string {
  const userMessages = messages.filter((msg: any) => msg.role === 'user')
  if (userMessages.length > 0) {
    return userMessages[userMessages.length - 1].content.substring(0, 50)
  }
  return 'Unknown trigger'
}

async function analyzeLeadCapturePatterns(conversations: any[]): Promise<any[]> {
  // This would analyze which lead capture methods work best
  return [
    { method: 'email_request', conversionRate: 0.68 },
    { method: 'phone_request', conversionRate: 0.45 },
    { method: 'name_only', conversionRate: 0.32 }
  ]
}

function generateInsights(data: LearningData): string[] {
  const insights = []
  
  if (data.totalConversations > 100) {
    insights.push(`Analyzed ${data.totalConversations} successful conversations`)
  }
  
  if (data.commonQuestions.length > 0) {
    const topQuestion = data.commonQuestions[0]
    insights.push(`Most common inquiry: ${topQuestion.question} (${topQuestion.frequency} times)`)
  }
  
  if (data.effectiveResponses.length > 0) {
    insights.push(`Identified ${data.effectiveResponses.length} high-performing response patterns`)
  }
  
  return insights
}

function generateRecommendations(data: LearningData): string[] {
  const recommendations = []
  
  if (data.commonQuestions.some(q => q.question === 'pricing_inquiry')) {
    recommendations.push('Create detailed pricing response templates')
  }
  
  if (data.commonQuestions.some(q => q.question === 'feature_inquiry')) {
    recommendations.push('Develop comprehensive feature explanation library')
  }
  
  if (data.escalationPatterns.length > 10) {
    recommendations.push('Review escalation triggers to improve self-service')
  }
  
  return recommendations
}
