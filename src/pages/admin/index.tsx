import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import Icon from '@/components/Icon'
import { SkeletonTable } from '@/components/Skeleton'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    authStartTime: number
    sessionCheckTime: number
    authDuration: number
    lastError: string | null
    retryCount: number
  }>({
    authStartTime: Date.now(),
    sessionCheckTime: 0,
    authDuration: 0,
    lastError: null,
    retryCount: 0
  })
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

  useEffect(() => {
    if (!router.isReady) return
    
    const checkAuth = async () => {
      const startTime = Date.now()
      setDebugInfo(prev => ({ ...prev, authStartTime: startTime, sessionCheckTime: startTime }))
      
      try {
        console.log('🔍 [ADMIN DEBUG] Starting authentication check...')
        console.log('🔍 [ADMIN DEBUG] Timestamp:', new Date().toISOString())
        console.log('🔍 [ADMIN DEBUG] Router ready:', router.isReady)
        console.log('🔍 [ADMIN DEBUG] Current path:', router.pathname)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          const errorMsg = `Session retrieval error: ${sessionError.message}`
          console.error('🚨 [ADMIN ERROR]', errorMsg)
          setDebugInfo(prev => ({ 
            ...prev, 
            lastError: errorMsg, 
            retryCount: prev.retryCount + 1 
          }))
          
          setTimeout(() => {
            console.log('🔄 [ADMIN DEBUG] Retrying authentication in 3 seconds...')
            checkAuth()
          }, 3000)
          return
        }
        
        if (!session) {
          const errorMsg = 'No session found - user not logged in'
          console.error('🚨 [ADMIN ERROR]', errorMsg)
          setDebugInfo(prev => ({ 
            ...prev, 
            lastError: errorMsg, 
            retryCount: prev.retryCount + 1 
          }))
          
          console.log('🔄 [ADMIN DEBUG] Attempting redirect to login...')
          router.push('/login')
          return
        }
        
        const adminEmail = 'abdalrahimmakkawi@gmail.com'
        const userEmail = session.user.email
        const authDuration = Date.now() - startTime
        
        console.log('🔍 [ADMIN DEBUG] Session retrieved successfully')
        console.log('🔍 [ADMIN DEBUG] User email:', userEmail)
        console.log('🔍 [ADMIN DEBUG] Required admin email:', adminEmail)
        console.log('🔍 [ADMIN DEBUG] Email match:', userEmail === adminEmail ? '✅' : '❌')
        console.log('🔍 [ADMIN DEBUG] Auth duration:', authDuration + 'ms')
        
        setDebugInfo(prev => ({ 
          ...prev, 
          authDuration,
          lastError: null 
        }))
        
        if (userEmail !== adminEmail) {
          const errorMsg = `Email mismatch: ${userEmail} != ${adminEmail}`
          console.error('🚨 [ADMIN ERROR]', errorMsg)
          setDebugInfo(prev => ({ 
            ...prev, 
            lastError: errorMsg, 
            retryCount: prev.retryCount + 1 
          }))
          
          console.log('🔄 [ADMIN DEBUG] Attempting redirect to login...')
          router.push('/login')
          return
        }
        
        // User is admin — allow access
        console.log('✅ [ADMIN SUCCESS] Admin access granted')
        console.log('🔍 [ADMIN DEBUG] User ID:', session.user.id)
        console.log('🔍 [ADMIN DEBUG] Session expires:', new Date(session.expires_at || '').toISOString())
        
        setUser(session.user)
        setIsAuthorized(true)
        setLoading(false)
        fetchData()
        
      } catch (error: any) {
        const errorMsg = `Auth check failed: ${error?.message || 'Unknown error'}`
        console.error('🚨 [ADMIN ERROR]', errorMsg)
        console.error('🚨 [ADMIN ERROR] Full error object:', error)
        setDebugInfo(prev => ({ 
          ...prev, 
          lastError: errorMsg, 
          retryCount: prev.retryCount + 1 
        }))
        
        console.log('🔄 [ADMIN DEBUG] Attempting redirect to login due to auth error...')
        router.push('/login')
      }
    }
  
  checkAuth()
}, [router.isReady])

  // Don't render anything until auth is confirmed
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">🔍 Admin Authentication Debug Mode</p>
          <p className="text-sm text-gray-500">Checking session...</p>
          {debugInfo.lastError && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              Last Error: {debugInfo.lastError}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Retry Count: {debugInfo.retryCount}
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

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
      <Head><title>Admin Dashboard — NexAgent</title></Head>
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
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending Review</span>
                <Icon name="clock" size={16} style={{ color: '#fbbf24' }} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{stats.pendingReview}</div>
                <div className="text-gray-600">Pending Review</div>
              </div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Active Agents</span>
                <Icon name="check" size={16} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.activeAgents}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
