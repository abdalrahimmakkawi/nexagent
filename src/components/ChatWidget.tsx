// src/components/ChatWidget.tsx
import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { StoreConfig } from '@/lib/store-configs'

interface Props {
  store: StoreConfig
  welcomeMessage: string
}

function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md"
      style={{
        background: 'rgba(79,168,255,0.15)',
        color: '#4fa8ff',
        border: '1px solid rgba(79,168,255,0.3)',
      }}>
      ◆ DeepSeek
    </span>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'var(--t2)',
            animation: `typing 1.1s ease-in-out ${i * 0.18}s infinite`,
          }} />
      ))}
      <style>{`@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  )
}

export default function ChatWidget({ store, welcomeMessage }: Props) {
  const { messages, loading, sendMessage, reset } = useChat({ storeId: store.id })
  const [input, setInput] = useState('')
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadValue, setLeadValue] = useState('')
  const [showLead, setShowLead] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const assistantCount = messages.filter(m => m.role === 'assistant').length

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (assistantCount === 2 && !leadCaptured) setShowLead(true)
  }, [assistantCount, leadCaptured])

  async function handleSend() {
    if (!input.trim()) return
    const msg = input
    setInput('')
    await sendMessage(msg)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function captureLead() {
    const isEmail = store.leadField === 'email'
    if (!leadValue || (isEmail && !leadValue.includes('@'))) return
    setLeadCaptured(true)
    setShowLead(false)
    // In production: POST to /api/leads with leadValue, storeId, timestamp
    console.log('[Lead captured]', { store: store.id, field: store.leadField, value: leadValue })
  }

  const allMessages = [
    { id: 'welcome', role: 'assistant' as const, content: welcomeMessage, provider: undefined, latencyMs: undefined },
    ...messages,
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--s1)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--s2)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>
          🤖
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">{store.agentName}</div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--green)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            Online · &lt;1s response
          </div>
        </div>
        <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--t2)', border: '1px solid var(--border)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--t2)')}>
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {allMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animation: 'fadeUp 0.25s ease both' }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}
              style={msg.role === 'assistant'
                ? { background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }
                : { background: 'var(--s3)', border: '1px solid var(--border2)' }}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className={`flex flex-col gap-1.5 max-w-[72%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className="px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed"
                style={msg.role === 'assistant'
                  ? { background: 'var(--s2)', border: '1px solid var(--border)', borderTopLeftRadius: 4, color: 'var(--text)' }
                  : { background: 'linear-gradient(135deg,#4f3ec8,var(--accent))', borderTopRightRadius: 4, color: '#fff' }}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}>
              </div>
              {msg.role === 'assistant' && msg.provider && (
                <div className="flex items-center gap-2 px-1">
                  <ProviderBadge provider={msg.provider} />
                  {msg.latencyMs && (
                    <span className="text-[10px] font-mono" style={{ color: 'var(--t3)' }}>{msg.latencyMs}ms</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Lead capture card */}
        {showLead && !leadCaptured && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(107,92,231,0.08)', border: '1px solid rgba(107,92,231,0.25)' }}>
            <div className="text-xs font-bold mb-3" style={{ color: 'var(--accent3)' }}>{store.leadLabel}</div>
            <input
              type={store.leadField}
              value={leadValue}
              onChange={e => setLeadValue(e.target.value)}
              placeholder={store.leadField === 'email' ? 'your@email.com' : '+1 (555) 000-0000'}
              className="w-full text-sm px-3 py-2 rounded-lg mb-2 outline-none"
              style={{ background: 'var(--s1)', border: '1px solid var(--border2)', color: 'var(--text)' }}
              onKeyDown={e => e.key === 'Enter' && captureLead()}
            />
            <button onClick={captureLead}
              className="w-full py-2 rounded-lg text-sm font-bold text-white transition-opacity"
              style={{ background: 'var(--accent)' }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
              Subscribe →
            </button>
          </div>
        )}

        {leadCaptured && (
          <div className="text-xs font-bold px-1" style={{ color: 'var(--green)' }}>
            ✅ You're subscribed!
          </div>
        )}

        {loading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
            <div className="rounded-2xl" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderTopLeftRadius: 4 }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts - show only initially */}
      {messages.length === 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {store.quickPrompts.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--t2)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(107,92,231,0.4)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t2)' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2.5 items-end rounded-xl px-4 py-2.5 transition-all"
          style={{ background: 'var(--s2)', border: '1px solid var(--border2)' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1} placeholder="Ask anything…"
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: 'var(--text)', maxHeight: 120 }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }} />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
            style={{ background: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between mt-1.5 px-1">
          <span className="text-[10px] font-mono" style={{ color: 'var(--t3)' }}>↵ send · shift+↵ newline</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--t3)' }}>{input.length}/400</span>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
