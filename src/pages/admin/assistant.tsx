import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function AdminAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Admin email from environment
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdalrahimmakkawi@gmail.com'

  const conversationStarters = [
    "Analyze this week's metrics",
    "Write a LinkedIn post",
    "How should I respond to this client?",
    "Who are my biggest competitors?",
    "Give me content ideas",
    "Review my pricing strategy",
    "Suggest upsell opportunities"
  ]

  useEffect(() => {
    checkAdminAccess()
    loadChatSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/admin/login'
        return
      }

      if (user.email !== ADMIN_EMAIL) {
        window.location.href = '/admin'
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Admin check failed:', error)
      window.location.href = '/admin/login'
    } finally {
      setLoading(false)
    }
  }

  const loadChatSessions = async () => {
    // Load from localStorage first
    const stored = localStorage.getItem('adminChatSessions')
    if (stored) {
      const sessions = JSON.parse(stored)
      setChatSessions(sessions)
      
      if (sessions.length > 0) {
        const latest = sessions[0]
        setCurrentSessionId(latest.id)
        setMessages(latest.messages)
      }
    }

    // Also load from database for persistence
    try {
      const response = await fetch('/api/admin/assistant/history', {
        headers: { 'X-Admin-Key': 'nexagent-admin-2024' }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Merge database sessions with localStorage sessions
        // (localStorage takes precedence for recent changes)
        console.log('Loaded conversation history from database:', data.count, 'conversations')
      }
    } catch (error) {
      console.error('Failed to load conversation history from database:', error)
    }
  }

  const saveChatSessions = (sessions: ChatSession[]) => {
    localStorage.setItem('adminChatSessions', JSON.stringify(sessions))
  }

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    }

    const updatedSessions = [newSession, ...chatSessions]
    setChatSessions(updatedSessions)
    setCurrentSessionId(newSession.id)
    setMessages([])
    saveChatSessions(updatedSessions)
  }

  const loadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
    }
  }

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage

    const updatedSessions = chatSessions.map(session =>
      session.id === sessionId ? { ...session, title } : session
    )
    
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const saveConversationToDatabase = async (sessionId: string, title: string, messages: Message[]) => {
    try {
      await fetch('/api/admin/assistant/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Key': 'nexagent-admin-2024'
        },
        body: JSON.stringify({
          sessionId,
          title,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })),
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to save conversation to database:', error)
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isTyping) return

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Update session title if this is the first message
    if (messages.length === 0) {
      updateSessionTitle(currentSessionId, messageText)
    }

    try {
      const response = await fetch('/api/admin/assistant', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Key': 'nexagent-admin-2024'
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: currentSessionId
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save messages to current session
      const updatedSessions = chatSessions.map(session =>
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, userMessage, assistantMessage] }
          : session
      )
      
      // Save to localStorage
      setChatSessions(updatedSessions)
      saveChatSessions(updatedSessions)

      // Also save to database for persistence
      const currentSession = updatedSessions.find(s => s.id === currentSessionId)
      await saveConversationToDatabase(currentSessionId, currentSession?.title || 'Admin Conversation', currentSession?.messages || [])

    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleStarterClick = (starter: string) => {
    sendMessage(starter)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070d' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect
  }

  return (
    <>
      <Head>
        <title>Admin Assistant - NexAgent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen flex" style={{ background: '#07070d' }}>
        {/* Left Sidebar */}
        <div className="w-56 flex flex-col border-r" style={{ background: '#0d0d18', borderColor: 'rgba(245,158,11,0.2)' }}>
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
            <h2 className="text-lg font-bold flex items-center" style={{ color: '#f59e0b', fontFamily: "'Playfair Display', serif" }}>
              <Icon name="sparkle" size={20} style={{ marginRight: '8px' }} />
              Admin Assistant
            </h2>
          </div>

          {/* Conversation Starters */}
          <div className="p-4 border-b" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Quick Actions
            </h3>
            <div className="space-y-1">
              {conversationStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(starter)}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-800 transition-all"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Recent Chats
              </h3>
              <button
                onClick={createNewChat}
                className="px-2 py-1 text-xs rounded hover:bg-gray-800 transition-all"
                style={{ color: '#f59e0b' }}
              >
                New
              </button>
            </div>
            <div className="space-y-1">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-all ${
                    currentSessionId === session.id
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-800'
                  }`}
                  style={{ 
                    color: currentSessionId === session.id ? '#f59e0b' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  <div className="truncate">{session.title}</div>
                  <div className="text-xs opacity-50">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                AI Business Advisor
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm" style={{ color: '#f59e0b' }}>Connected</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="sparkle" size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#fff' }}>
                  Welcome to your AI Assistant
                </h3>
                <p className="text-gray-400 mb-6">
                  I'm your personal business advisor for NexAgent. I have access to real platform data and can help you with strategy, content, and decision-making.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {conversationStarters.slice(0, 3).map((starter, index) => (
                    <button
                      key={index}
                      onClick={() => handleStarterClick(starter)}
                      className="px-4 py-2 rounded-lg border hover:bg-gray-800 transition-all"
                      style={{ 
                        borderColor: 'rgba(245,158,11,0.3)', 
                        color: '#f59e0b' 
                      }}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                      style={message.role === 'user' ? { backgroundColor: '#f59e0b' } : {}}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 p-4 rounded-lg">
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
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
            <div className="flex space-x-3">
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
                placeholder="Ask me anything about NexAgent..."
                className="flex-1 resize-none bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-amber-500"
                rows={1}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: '#f59e0b' }}
              >
                Send
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Try commands: /linkedin, /reddit, /dm, /email, /response
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
