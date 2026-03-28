import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabaseAdmin } from '@/lib/supabase'
import Icon from '@/components/Icon'

export default function DataExplorer() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clients' | 'agents' | 'leads' | 'waitlist'>('clients')
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalClients: 0,
    activeAgents: 0,
    totalLeads: 0,
    waitlistSignups: 0
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Add a small delay to let Supabase restore session
    const checkAuth = async () => {
      // First try to get existing session
      const { data: { session } } = await supabaseAdmin.auth.getSession()
      
      if (!session) {
        // Wait for auth state to be determined
        const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
          (event, session) => {
            subscription.unsubscribe()
            if (!session) {
              router.push('/login')
              return
            }
            // Check admin email
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
            if (session.user.email !== adminEmail) {
              router.push('/')
              return
            }
            setUser(session.user)
            setLoading(false)
          }
        )
        // Timeout fallback — if no auth event in 3 seconds, redirect to login
        setTimeout(() => {
          subscription.unsubscribe()
          router.push('/login')
        }, 3000)
        return
      }
      
      // Session exists — check admin email
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      if (session.user.email !== adminEmail) {
        router.push('/')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
  
    checkAuth()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data
      const [clientsRes, agentsRes, leadsRes, waitlistRes] = await Promise.all([
        supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('agents').select('*, clients(*)').order('created_at', { ascending: false }),
        supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('waitlist').select('*').order('created_at', { ascending: false })
      ])

      setClients(clientsRes.data || [])
      setAgents(agentsRes.data || [])
      setLeads(leadsRes.data || [])
      setWaitlist(waitlistRes.data || [])

      // Calculate stats
      setStats({
        totalClients: clientsRes.data?.length || 0,
        activeAgents: agentsRes.data?.filter((a: any) => a.status === 'active').length || 0,
        totalLeads: leadsRes.data?.length || 0,
        waitlistSignups: waitlistRes.data?.length || 0
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data: any[], filename: string, columns: string[]) => {
    const csv = [
      columns.join(','),
      ...data.map(row => 
        columns.map(col => {
          const value = row[col]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending_review: { bg: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
      active: { bg: 'rgba(34,197,94,0.2)', color: '#22c55e' },
      rejected: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
      cancelled: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' }
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

  const getPlanBadge = (plan: string) => {
    const colors = {
      starter: { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6' },
      growth: { bg: 'rgba(99,102,241,0.2)', color: '#6366f1' },
      scale: { bg: 'rgba(168,85,247,0.2)', color: '#a855f7' },
      cancelled: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' }
    }
    const style = colors[plan as keyof typeof colors] || colors.starter
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
        style={{ background: style.bg, color: style.color }}
      >
        {plan || 'starter'}
      </span>
    )
  }

  const filterData = (data: any[], searchFields: string[]) => {
    if (!searchTerm) return data
    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }

  const filteredClients = filterData(clients, ['email', 'business_name', 'plan', 'agent_status'])
  const filteredAgents = filterData(agents, ['name', 'status', 'clients.business_name'])
  const filteredLeads = filterData(leads, ['value', 'field_type', 'store_id', 'store_name'])
  const filteredWaitlist = filterData(waitlist, ['business_name', 'email', 'business_type'])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0a0a12' }}>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Data Explorer — NexAgent Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#0a0a12' }}>
        {/* Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                Data Explorer
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
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Icon name="sparkle" size={14} />
                  <span>AI Assistant</span>
                </a>
                <a 
                  href="/admin/data" 
                  className="text-sm font-medium transition-all flex items-center space-x-1"
                  style={{ color: '#6b5ce7' }}
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Clients</span>
                <Icon name="users" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.totalClients}</div>
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

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Waitlist Signups</span>
                <Icon name="clock" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.waitlistSignups}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg" style={{ background: '#0d0d18' }}>
              {(['clients', 'agents', 'leads', 'waitlist'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <Icon name="refresh" size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Data Tables */}
          <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h2 className="text-lg font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Clients ({filteredClients.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Business Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Agent Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-opacity-50" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{client.email}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium" style={{ color: '#fff' }}>{client.business_name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPlanBadge(client.plan)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(client.agent_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(client.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h2 className="text-lg font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Agents ({filteredAgents.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Business</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Agent Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {filteredAgents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-opacity-50" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium" style={{ color: '#fff' }}>
                              {agent.clients?.business_name || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium" style={{ color: '#fff' }}>{agent.name}</span>
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
                </div>
              </>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h2 className="text-lg font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Leads ({filteredLeads.length})
                  </h2>
                  <button
                    onClick={() => exportToCSV(filteredLeads, 'leads', ['created_at', 'value', 'field_type', 'store_name'])}
                    disabled={filteredLeads.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Icon name="chevron-down" size={16} />
                    <span>Export CSV</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Store</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-opacity-50" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium" style={{ color: '#fff' }}>{lead.value}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              {lead.field_type || 'email'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              {lead.store_name || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Waitlist Tab */}
            {activeTab === 'waitlist' && (
              <>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h2 className="text-lg font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Waitlist ({filteredWaitlist.length})
                  </h2>
                  <button
                    onClick={() => exportToCSV(filteredWaitlist, 'waitlist', ['position', 'business_name', 'email', 'business_type', 'created_at'])}
                    disabled={filteredWaitlist.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Icon name="chevron-down" size={16} />
                    <span>Export CSV</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Business Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {filteredWaitlist.map((entry) => (
                        <tr key={entry.id} className="hover:bg-opacity-50" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium" style={{ color: '#fff' }}>{entry.position}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium" style={{ color: '#fff' }}>{entry.business_name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{entry.email}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              {entry.business_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Empty state */}
            {((activeTab === 'clients' && filteredClients.length === 0) ||
              (activeTab === 'agents' && filteredAgents.length === 0) ||
              (activeTab === 'leads' && filteredLeads.length === 0) ||
              (activeTab === 'waitlist' && filteredWaitlist.length === 0)) && (
              <div className="text-center py-12">
                <Icon name="robot" size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {searchTerm ? 'No results match your search' : `No ${activeTab} found`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
