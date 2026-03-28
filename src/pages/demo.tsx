import { useState } from 'react'
import Head from 'next/head'
import Icon from '@/components/Icon'

export default function DemoPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with orders, returns, product questions, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Thanks for your message! This is a demo of the NexAgent AI assistant. In a real implementation, I would be connected to your business data and provide personalized responses about your products, services, and policies. I can handle customer inquiries, process orders, track shipments, and even capture leads automatically.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      <Head>
        <title>NexAgent Live Demo</title>
        <meta name="description" content="Try our AI agent demo - see how it handles customer inquiries 24/7" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: '#07070d',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ color: '#6366f1', fontSize: 18, fontWeight: 'bold' }}>Nex</span>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Agent Demo</span>
          </div>
          <a 
            href="/"
            style={{
              color: '#8888b8',
              textDecoration: 'none',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Icon name="arrow-right" size={16} />
            Back to site
          </a>
        </div>

        {/* Chat Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            {messages.map((message) => (
              <div key={message.id} style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: 1.4
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#8888b8',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    animation: 'pulse 1.5s infinite'
                  }} />
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about orders, returns, products..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              style={{
                padding: '12px 20px',
                background: inputValue.trim() && !isTyping ? '#6366f1' : 'rgba(99,102,241,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 14,
                fontWeight: 600,
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: '#8888b8',
          fontSize: 12
        }}>
          This is a demo. Actual AI agents are trained on your business data and integrate with your systems.
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
