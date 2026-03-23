// src/pages/demo.tsx
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import ChatWidget from '@/components/ChatWidget'
import { getAllStores, StoreConfig } from '@/lib/store-configs'

const WELCOME: Record<string, string> = {
  fashion: "👋 Hey! I'm Aria, Nova Apparel's support assistant. I can help with orders, returns, sizing, or finding your next favourite outfit.",
  electronics: "👋 Hi! I'm Nex from TechVault. Looking for a product recommendation, tracking an order, or need tech support?",
  beauty: "✨ Welcome to Lumière! I'm Belle, your personal beauty advisor. Skincare advice or order help — I'm here.",
  food: "🍕 Ciao! I'm Marco, your Crust & Co. concierge. Ready to order, check the menu, or plan a group feast?",
}

const METRICS = [
  { label: 'Resolution rate', value: '94%', color: 'var(--green)' },
  { label: 'Avg response', value: '2.1s', color: 'var(--amber)' },
  { label: 'Always on', value: '24/7', color: 'var(--text)' },
  { label: 'Avg ROI', value: '3.2×', color: '#c4baff' },
]

const CAPS = [
  { icon: '🎯', name: 'Lead Capture', badge: 'ON', type: 'on' },
  { icon: '📦', name: 'Order & Shipping FAQ', badge: 'ON', type: 'on' },
  { icon: '🔄', name: 'Returns & Refunds', badge: 'ON', type: 'on' },
  { icon: '🛒', name: 'Cart Recovery', badge: 'PRO', type: 'pro' },
  { icon: '📊', name: 'Sentiment Analysis', badge: 'PRO', type: 'pro' },
]

export default function DemoPage() {
  const stores = getAllStores()
  const [activeStore, setActiveStore] = useState<StoreConfig>(stores[0])
  const [chatKey, setChatKey] = useState(0)

  function switchStore(store: StoreConfig) {
    setActiveStore(store)
    setChatKey(k => k + 1)
  }

  return (
    <>
      <Head>
        <title>Live Demo — NexAgent</title>
      </Head>
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>

        {/* Top bar */}
        <div className="flex items-center border-b flex-shrink-0" style={{ height: 56, borderColor: 'var(--border)', background: 'var(--s1)' }}>
          <Link href="/" className="flex items-center gap-2.5 px-5 border-r h-full no-underline" style={{ borderColor: 'var(--border)', width: 260 }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
            <span className="font-bold text-sm">NexAgent</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
              style={{ background: 'rgba(107,92,231,0.2)', color: '#c4baff', border: '1px solid rgba(107,92,231,0.3)' }}>DEMO</span>
          </Link>
          <div className="flex items-center gap-2 px-5 flex-1">
            {stores.map(s => (
              <button key={s.id} onClick={() => switchStore(s)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={activeStore.id === s.id
                  ? { background: 'rgba(107,92,231,0.12)', border: '1px solid rgba(107,92,231,0.35)', color: '#c4baff' }
                  : { background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--t2)' }}>
                <span>{s.emoji}</span>{s.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-5 text-xs font-bold"
            style={{ color: 'var(--green)', background: 'rgba(61,255,160,0.06)', borderLeft: '1px solid var(--border)', height: '100%' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            LIVE
          </div>
          <div className="flex items-center gap-3 px-5">
            <Link href="/" className="text-xs font-medium hover:underline" style={{ color: 'var(--t2)' }}>
              ← Back to site
            </Link>
            <Link href="/login" className="text-xs font-medium hover:underline" style={{ color: 'var(--t2)' }}>
              Login
            </Link>
            <Link href="/waitlist" className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--accent)', color: 'white' }}>
              Get Started
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex flex-col border-r overflow-y-auto" style={{ width: 260, borderColor: 'var(--border)', background: 'var(--s1)', flexShrink: 0 }}>

            {/* Agent info */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--t3)' }}>Agent</div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--s2)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
                <div>
                  <div className="font-bold text-sm">{activeStore.agentName}</div>
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--green)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                    Online · &lt;1s
                  </div>
                </div>
              </div>
            </div>

            {/* Waitlist banner */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs text-center leading-relaxed" style={{ color: 'var(--t2)' }}>
                Want this agent for your business?<br />
                <Link href="/waitlist" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                  Join the waitlist →
                </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--t3)' }}>Performance</div>
              <div className="grid grid-cols-2 gap-2">
                {METRICS.map(m => (
                  <div key={m.label} className="p-2.5 rounded-lg" style={{ background: 'var(--s2)', border: '1px solid var(--border)' }}>
                    <div className="font-mono text-xl font-medium leading-none mb-1" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-[10px]" style={{ color: 'var(--t2)' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--t3)' }}>Capabilities</div>
              <div className="flex flex-col gap-1.5">
                {CAPS.map(c => (
                  <div key={c.name} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: 'var(--s2)', border: '1px solid var(--border)' }}>
                    <span className="text-sm">{c.icon}</span>
                    <span className="text-xs font-medium flex-1">{c.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={c.type === 'on'
                        ? { background: 'rgba(61,255,160,0.1)', color: 'var(--green)', border: '1px solid rgba(61,255,160,0.2)' }
                        : { background: 'rgba(255,184,77,0.1)', color: 'var(--amber)', border: '1px solid rgba(255,184,77,0.2)' }}>
                      {c.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Routing info */}
            <div className="p-4">
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--t3)' }}>AI Routing</div>
              <div className="text-xs p-3 rounded-lg leading-relaxed" style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--t2)' }}>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: '#4fa8ff' }}>◆ DeepSeek</span> — All queries powered by DeepSeek V3
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden">
            <ChatWidget key={chatKey} store={activeStore} welcomeMessage={WELCOME[activeStore.id]} />
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </>
  )
}
