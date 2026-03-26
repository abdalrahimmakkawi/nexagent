import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState<any>(null)
  const [agent, setAgent] = useState<any>(null)
  const [stats, setStats] = useState({
    conversations: 0,
    leads: 0,
  })
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        fetchClientData(session.user.id)
      }
    })
  }, [router])

  const fetchClientData = async (userId: string) => {
    try {
      // Get client data
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', userId)
        .single()

      setClientData(client)

      // Get agent if exists
      if (client) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .eq('client_id', userId)
          .single()

        setAgent(agentData)

        // Fetch stats if agent is active
        if (agentData?.status === 'active') {
          const { count: conversations } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agentData.id)

          const { count: leads } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agentData.id)

          setStats({
            conversations: conversations || 0,
            leads: leads || 0,
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch client data:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyWidgetCode = () => {
    const widgetCode = `<script src="${process.env.NEXT_PUBLIC_SITE_URL}/widget/${user?.id}"></script>`
    navigator.clipboard.writeText(widgetCode)
    alert('Widget code copied to clipboard!')
  }

  if (loading) return <div>Loading...</div>

  // STATE 1 — No onboarding yet
  if (!clientData?.onboarding_completed) {
    return (
      <>
        <Head><title>Dashboard — NexAgent</title></Head>
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0a12' }}>
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Icon name="robot" size={32} style={{ color: '#fff' }} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Welcome to NexAgent!
            </h1>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Let's set up your AI agent to handle customer support 24/7.
            </p>
            <Link href="/onboarding">
              <button className="px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2" style={{ background: '#6366f1', color: '#fff' }}>
                Set up your AI agent →
              </button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  // STATE 2 — Onboarding done, pending review
  if (!clientData?.agent_approved) {
    return (
      <>
        <Head><title>Dashboard — NexAgent</title></Head>
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0a12' }}>
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
              <Icon name="clock" size={32} style={{ color: '#fff' }} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Your agent is being reviewed
            </h1>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              We'll notify you by email within 24 hours once your AI agent is ready to go live.
            </p>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </>
    )
  }

  // STATE 3 — Agent approved and active
  return (
    <>
      <Head><title>Dashboard — NexAgent</title></Head>
      <div className="min-h-screen" style={{ background: '#0a0a12' }}>
        {/* Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {agent?.name} • <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>Active</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/logout">
                <button className="text-sm px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                  Logout
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Conversations</span>
                <Icon name="message" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.conversations}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Leads Captured</span>
                <Icon name="target" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.leads}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Resolution Rate</span>
                <Icon name="check" size={16} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>94%</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Agent Uptime</span>
                <Icon name="zap" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>99.9%</div>
            </div>
          </div>

          {/* Widget Code Section */}
          <div className="rounded-lg p-6 mb-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Get Your Widget Code
            </h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Add this script to your website to enable the AI agent:
            </p>
            <div className="flex gap-3">
              <div className="flex-1 px-4 py-3 rounded-lg font-mono text-sm" style={{ background: 'rgba(0,0,0,0.3)', color: '#a5b4fc' }}>
                &lt;script src="{process.env.NEXT_PUBLIC_SITE_URL}/widget/{user?.id}"&gt;&lt;/script&gt;
              </div>
              <button
                onClick={copyWidgetCode}
                className="px-4 py-3 rounded-lg font-semibold transition-all"
                style={{ background: '#6366f1', color: '#fff' }}
              >
                Copy
              </button>
            </div>
            <div className="mt-4">
              <Link href="/docs/installation" className="text-sm" style={{ color: '#a5b4fc' }}>
                View installation guide →
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/conversations">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Icon name="message" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Conversations</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  View all customer conversations
                </p>
              </div>
            </Link>

            <Link href="/dashboard/leads">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Icon name="target" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Leads</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Manage captured leads
                </p>
              </div>
            </Link>

            <Link href="/dashboard/agent">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Icon name="robot" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Agent Settings</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Configure your AI agent
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
