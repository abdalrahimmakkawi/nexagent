import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'
import { SkeletonTable } from '@/components/Skeleton'
import { ADMIN_EMAIL } from '@/lib/admin'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<any[]>([])
  const [stats, setStats] = useState<{
    totalClients: number
    pendingReview: number
    activeAgents: number
    totalLeads: number
  }>({
    totalClients: 0,
    pendingReview: 0,
    activeAgents: 0,
    totalLeads: 0,
  })
  const [user, setUser] = useState<any>(null)
  const [pendingAgents, setPendingAgents] = useState<any[]>([])
  const [agentBuildingStatus, setAgentBuildingStatus] = useState<{
    isBuilding: boolean
    currentAgent?: string
    progress: number
  }>({
    isBuilding: false,
    progress: 0
  })

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log('Checking admin authentication...')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No session found, redirecting to login')
          window.location.href = '/login'
          return
        }
        
        const adminEmail = ADMIN_EMAIL
        console.log('Session email:', session.user.email)
        console.log('Required admin email:', adminEmail)
        
        if (session.user.email !== adminEmail) {
          console.log('Email mismatch, redirecting to login')
          window.location.href = '/login'
          return
        }
        
        // User is admin — allow access
        console.log('Admin access granted')
        setUser(session.user)
        setLoading(false)
        fetchData()
        
      } catch (error) {
        console.error('Auth error:', error)
        console.log('Redirecting to login due to auth error')
        window.location.href = '/login'
      }
    }
  
  checkAdmin()
}, [router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Fetch pending agents
  const fetchPendingAgents = async () => {
    try {
      const { data: pendingAgentsData } = await supabase
        .from('agents')
        .select('id, name, status, created_at, clients(business_name, email)')
        .in('status', ['pending_review', 'building', 'generating'])
        .order('created_at', { ascending: false }) as any
      
      setPendingAgents(pendingAgentsData || [])
    } catch (error) {
      console.error('[Admin] Error fetching pending agents:', error)
    }
  }

  // Auto-refresh pending agents every 30 seconds
  useEffect(() => {
    if (!user) return
    
    fetchPendingAgents()
    const interval = setInterval(fetchPendingAgents, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Simulate agent building status updates
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      // Randomly simulate agent building for demo
      const shouldBuild = Math.random() > 0.7
      if (shouldBuild && !agentBuildingStatus.isBuilding) {
        setAgentBuildingStatus({
          isBuilding: true,
          currentAgent: 'School Assistant',
          progress: 0
        })

        // Simulate building progress
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += 10
          setAgentBuildingStatus(prev => ({
            ...prev,
            progress
          }))

          if (progress >= 100) {
            clearInterval(progressInterval)
            setTimeout(() => {
              setAgentBuildingStatus({
                isBuilding: false,
                currentAgent: undefined,
                progress: 0
              })
            }, 2000)
          }
        }, 800)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, agentBuildingStatus.isBuilding])

  const pendingCount = pendingAgents.filter(a => a.status === 'pending_review').length

  const fetchData = async () => {
    try {
      // Fetch agents with client info
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*, clients(*)')
        .order('created_at', { ascending: false })

      // Fetch stats
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      const pendingCount = (agentsData as any[])?.filter(a => a.status === 'pending_review').length || 0
      const activeCount = (agentsData as any[])?.filter(a => a.status === 'active').length || 0

      setAgents(agentsData || [])
      setStats({
        totalClients: totalClients || 0,
        pendingReview: pendingCount,
        activeAgents: activeCount,
        totalLeads: totalLeads || 0,
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending_review: { bg: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
      active: { bg: 'rgba(34,197,94,0.2)', color: '#22c55e' },
      rejected: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
    }
    const style = colors[status as keyof typeof colors] || colors.pending_review
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: style.bg, color: style.color }}
      >
        {status === 'pending_review' ? 'Pending Review' : status}
      </span>
    )
  }

  if (loading) return <SkeletonTable rows={5} />

  return (
    <>
      <Head>
        <title>{pendingCount > 0 ? `(${pendingCount}) NexAgent Admin` : 'NexAgent Admin'}</title>
        <meta name="description" content="NexAgent Admin Dashboard" />
      </Head>
      <div className="min-h-screen" style={{ background: '#0a0a12' }}>
        {/* Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                Admin Dashboard
              </h1>
              <nav className="flex space-x-4">
                <a 
                  href="/admin" 
                  className="text-sm font-medium hover:text-white transition-all"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Overview
                </a>
                <a 
                  href="/admin/assistant" 
                  className="text-sm font-medium hover:text-white transition-all flex items-center space-x-1"
                  style={{ color: '#f59e0b' }}
                >
                  <Icon name="sparkle" size={14} />
                  <span>AI Assistant</span>
                </a>
                <a 
                  href="/admin/data" 
                  className="text-sm font-medium hover:text-white transition-all flex items-center space-x-1"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Icon name="robot" size={14} />
                  <span>Data Explorer</span>
                </a>
              </nav>
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        {pendingCount > 0 && (
          <div className="px-6 py-4" style={{ background: 'rgba(251,146,60,0.1)', borderBottom: '1px solid rgba(251,146,60,0.3)' }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-medium">
                  ⚡ You have {pendingCount} agent{pendingCount > 1 ? 's' : ''} ready to review
                </span>
              </div>
              <button
                onClick={() => {
                  const firstPending = pendingAgents.find(a => a.status === 'pending_review')
                  if (firstPending) {
                    router.push(`/admin/review/${firstPending.id}`)
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ 
                  background: 'rgba(251,146,60,0.2)',
                  color: '#fb923c',
                  border: '1px solid rgba(251,146,60,0.3)'
                }}
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Building Status Section */}
          <div className="mb-8">
            {pendingAgents.length > 0 ? (
              <div className="rounded-lg p-6" style={{ 
                background: 'rgba(251,146,60,0.1)', 
                border: '2px solid rgba(251,146,60,0.3)',
                borderRadius: '12px'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#fb923c' }}>
                    🔨 Agents Being Built
                  </h3>
                  <button
                    onClick={fetchPendingAgents}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ 
                      background: 'rgba(251,146,60,0.2)',
                      color: '#fb923c',
                      border: '1px solid rgba(251,146,60,0.3)'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="space-y-3">
                  {pendingAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium" style={{ color: '#fff' }}>
                            {agent.clients?.business_name || 'Unknown Business'}
                          </span>
                          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            → {agent.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'building' || agent.status === 'generating' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            {agent.status === 'building' && (
                              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            )}
                            {agent.status === 'generating' && (
                              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            )}
                            {agent.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {new Date(agent.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/review/${agent.id}`)}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ 
                          background: 'rgba(251,146,60,0.2)',
                          color: '#fb923c',
                          border: '1px solid rgba(251,146,60,0.3)'
                        }}
                      >
                        Review Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg p-4 text-center" style={{ 
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)'
              }}>
                <span className="text-green-500 font-medium">✓ All agents up to date</span>
              </div>
            )}
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Clients</span>
                <Icon name="users" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.totalClients}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending Review</span>
                <Icon name="clock" size={16} style={{ color: '#fbbf24' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{stats.pendingReview}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Active Agents</span>
                <Icon name="check" size={16} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.activeAgents}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Leads</span>
                <Icon name="target" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.totalLeads}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>AI Engine</span>
                <Icon name="robot" size={16} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>NVIDIA</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                nemotron-4-340b-instruct
              </div>
            </div>

            <div className="rounded-lg p-6" style={{ background: agentBuildingStatus.isBuilding ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Agent Building</span>
                <div className="flex items-center gap-2">
                  {agentBuildingStatus.isBuilding && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                  <Icon name="refresh" size={16} style={{ color: agentBuildingStatus.isBuilding ? '#3b82f6' : 'rgba(255,255,255,0.4)' }} />
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: agentBuildingStatus.isBuilding ? '#3b82f6' : '#fff' }}>
                {agentBuildingStatus.isBuilding ? 'Building...' : 'Ready'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {agentBuildingStatus.currentAgent ? `Building: ${agentBuildingStatus.currentAgent}` : 'No active builds'}
                {agentBuildingStatus.progress > 0 && ` (${agentBuildingStatus.progress}%)`}
              </div>
            </div>
          </div>

          {/* Agents Table */}
          <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h2 className="text-lg font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                All Agents
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Business Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Agent Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-opacity-50" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#fff' }}>
                            {agent.clients?.business_name || 'Unknown'}
                          </div>
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {agent.clients?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {agent.clients?.business_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium" style={{ color: '#fff' }}>
                          {agent.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(agent.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {new Date(agent.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/admin/review/${agent.id}`)}
                          className="text-sm px-3 py-1 rounded-lg transition-all"
                          style={{ 
                            background: 'rgba(99,102,241,0.2)', 
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.3)'
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            {agents.length === 0 && (
              <div className="text-center py-12">
                <Icon name="robot" size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>No agents yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
