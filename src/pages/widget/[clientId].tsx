import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface WidgetConfig {
  agentId: string
  name: string
  welcomeMessage: string
  quickPrompts: string[]
  leadField?: string
  leadMessage?: string
  escalationTriggers: string[]
  widgetColor: string
  industry: string
  businessName: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentUsed?: string
  sentiment?: number
  actionsExecuted?: string[]
  hadPlan?: boolean
}

const AGENT_LABELS: Record<string, string> = {
  support: '🛡️ Support',
  sales: '💰 Sales',
  faq: '⚡ FAQ',
  escalation: '🚨 Priority',
  onboarding: '👋 Welcome',
  followup: '🔄 Follow-up',
  analytics: '📊 Analytics',
}

function getAgentLabel(agentType?: string): string {
  if (!agentType) return '🤖 Assistant'
  return AGENT_LABELS[agentType] || '🤖 Assistant'
}

function getSentimentColor(sentiment?: number): string {
  if (!sentiment) return 'transparent'
  if (sentiment > 0.6) return 'rgba(34,197,94,0.5)' // green
  if (sentiment >= 0.3 && sentiment <= 0.6) return 'rgba(251,191,36,0.5)' // amber
  return 'rgba(239,68,68,0.5)' // red (escalation mode)
}

export default function WidgetPage() {
  const router = useRouter()
  const { clientId: clientIdQuery } = router.query
  const clientId = Array.isArray(clientIdQuery) ? clientIdQuery[0] : clientIdQuery
  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [showEscalation, setShowEscalation] = useState(false)
  const [leadValue, setLeadValue] = useState('')
  const [sessionId] = useState(() => 
    `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  )
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Show loading while router query is being resolved
  if (router.isReady === false) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a12' }}>
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch widget config
  const fetchConfig = async () => {
    if (!clientId || typeof clientId !== 'string') {
      setError('Invalid client ID')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/widget/${clientId}/config`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load widget')
      }

      setConfig(data)

      // Create conversation and load history
      const convResponse = await fetch(`/api/widget/${clientId}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: data.agentId,
          sessionId,
          loadHistory: true
        })
      })
      
      const convData = await convResponse.json()
      if (convResponse.ok) {
        setConversationId(convData.conversationId)
        
        // Load conversation history if exists
        if (convData.messages && convData.messages.length > 0) {
          const historyMessages = convData.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          setMessages(historyMessages)
        } else {
          // Add welcome message for new conversations
          setMessages([{
            role: 'assistant',
            content: data.welcomeMessage,
            timestamp: new Date()
          }])
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [router.isReady, clientId, sessionId])

  // Handle message sending
  const sendMessage = async (messageText: string) => {
    if (!config || !messageText.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setShowQuickPrompts(false)

    try {
      const response = await fetch(`/api/widget/${clientId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          agentId: config.agentId,
          messages: [...messages, userMessage],
          sessionId,
          conversationId
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        actionsExecuted: data.actionsExecuted,
        hadPlan: data.hadPlan
      }

      setMessages(prev => [...prev, assistantMessage])

      // Check for escalation triggers
      const hasEscalation = config.escalationTriggers.some(trigger =>
        messageText.toLowerCase().includes(trigger.toLowerCase())
      )
      if (hasEscalation) {
        setShowEscalation(true)
      }

      // Show lead capture after 2nd AI response
      const aiMessageCount = messages.filter(m => m.role === 'assistant').length
      if (aiMessageCount === 1 && config.leadField) {
        setShowLeadCapture(true)
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle lead capture
  const submitLead = async () => {
    if (!config || !leadValue.trim()) return

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.leadField,
          value: leadValue.trim(),
          source: 'widget',
          clientId,
          conversationId
        })
      })

      setShowLeadCapture(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Thank you! I've received your ${config.leadField} and someone will be in touch soon.`,
        timestamp: new Date()
      }])
    } catch (err) {
      console.error('Failed to submit lead:', err)
    }
  }

  // Handle conversation cleanup
  useEffect(() => {
    const cleanup = () => {
      if (conversationId) {
        fetch('/api/conversations/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId })
        }).catch(console.error)
      }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup)
    
    // Cleanup after 30 minutes of inactivity
    const timeout = setTimeout(() => {
      cleanup()
    }, 30 * 60 * 1000)

    return () => {
      window.removeEventListener('beforeunload', cleanup)
      clearTimeout(timeout)
    }
  }, [conversationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-600 mb-4">
            {error || 'This agent is not active yet'}
          </div>
          <div className="text-sm text-gray-500">
            Powered by NexAgent
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{config.name} - AI Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col h-screen bg-white" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: config.widgetColor }}>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="text-white font-medium">{config.name}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Online</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
                style={message.role === 'user' ? { backgroundColor: config.widgetColor } : {}}
              >
                {message.content}
                {/* Show actions executed */}
                {message.role === 'assistant' && message.actionsExecuted && message.actionsExecuted.length > 0 && (
                  <div style={{
                    marginTop: 6,
                    padding: '4px 10px',
                    background: 'rgba(118,185,0,0.1)',
                    border: '1px solid rgba(118,185,0,0.3)',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#76b900',
                  }}>
                    ✓ {message.actionsExecuted.join(' · ')}
                  </div>
                )}

                {/* Show agent badge for AI messages */}
                {message.role === 'assistant' && (message as any).agentUsed && (
                  <div style={{ 
                    fontSize: 10, 
                    color: 'rgba(255,255,255,0.3)',
                    marginTop: 4,
                    paddingLeft: 4,
                  }}>
                    {getAgentLabel((message as any).agentUsed)}
                  </div>
                )}
                {/* Show sentiment as border color */}
                {message.role === 'assistant' && (message as any).sentiment && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '0.5rem',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: getSentimentColor((message as any).sentiment),
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {showQuickPrompts && config.quickPrompts.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex flex-wrap gap-2">
              {config.quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1 text-sm rounded-full border hover:bg-gray-50"
                  style={{ borderColor: config.widgetColor, color: config.widgetColor }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lead Capture */}
        {showLeadCapture && config.leadField && (
          <div className="p-4 border-t bg-blue-50">
            <div className="text-sm font-medium mb-2">{config.leadMessage}</div>
            <div className="flex space-x-2">
              <input
                type={config.leadField === 'email' ? 'email' : 'tel'}
                value={leadValue}
                onChange={(e) => setLeadValue(e.target.value)}
                placeholder={`Enter your ${config.leadField}`}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: config.widgetColor,
                  '--tw-ring-color': config.widgetColor
                } as React.CSSProperties}
              />
              <button
                onClick={submitLead}
                className="px-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: config.widgetColor }}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Escalation Banner */}
        {showEscalation && (
          <div className="p-4 border-t bg-red-50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-red-900">
                Want to speak with a human?
              </div>
              <button
                onClick={() => window.open('https://nexagent-one.vercel.app/contact', '_blank')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Contact us
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Type your message..."
              className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              rows={1}
              style={{ 
                borderColor: config.widgetColor,
                '--tw-ring-color': config.widgetColor
              } as React.CSSProperties}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: config.widgetColor }}
            >
              Send
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Shift+Enter for newline
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400 text-center p-2">
          Powered by NexAgent
        </div>
      </div>
    </>
  )
}
