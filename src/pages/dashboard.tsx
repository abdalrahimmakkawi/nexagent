import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import Icon from '@/components/Icon'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/app#pricing')
  }, [router])

      // Get leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', userId)

      // Calculate weekly data for chart
      const weeklyData = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        
        // Count conversations for this day
        const dayCount = conversations?.filter(conv => {
          const convDate = new Date(conv.created_at)
          return convDate.toDateString() === date.toDateString()
        }).length || 0

        weeklyData.push({ day: dayName, count: dayCount })
      }

      const totalMessages = conversations?.reduce((sum, conv) => sum + (conv.message_count || 0), 0) || 0

      setStats({
        conversations: conversations?.length || 0,
        leads: leadsCount || 0,
        messages: totalMessages,
        weeklyData
      })

    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  // STATE 1 — No onboarding yet
  if (!clientData?.onboarding_completed) {
    return (
      <>
        <Head><title>Dashboard — NexAgent</title></Head>
        <DashboardLayout activeTab="overview">
          <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07070d' }}>
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
        </DashboardLayout>
      </>
    )
  }

  // STATE 2 — Agent created but not approved yet
  if (!agent || agent.status !== 'active') {
    return (
      <>
        <Head><title>Dashboard — NexAgent</title></Head>
        <DashboardLayout activeTab="overview">
          <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07070d' }}>
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                <Icon name="clock" size={32} style={{ color: '#fff' }} />
              </div>
              <h1 className="text-3xl font-bold mb-4" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                Agent Under Review
              </h1>
              <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Your AI agent is being reviewed by our team. This usually takes 24-48 hours.
              </p>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Agent Name:</span>
                    <span style={{ color: '#fff' }}>{agent?.name || 'Your Agent'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Status:</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {agent?.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Submitted:</span>
                    <span style={{ color: '#fff' }}>
                      {agent?.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </>
    )
  }

  // STATE 3 — Agent approved and active
  return (
    <>
      <Head><title>Dashboard — NexAgent</title></Head>
      <DashboardLayout activeTab="overview">
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Conversations</span>
                <Icon name="message" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.conversations}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Leads Captured</span>
                <Icon name="target" size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#fff' }}>{stats.leads}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Messages Handled</span>
                <Icon name="message" size={16} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.messages}</div>
            </div>

            <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Agent Status</span>
                <Icon name="check" size={16} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>Active</div>
            </div>
          </div>

          {/* Simple Chart */}
          <div className="rounded-lg p-6 mb-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Last 7 Days Activity
            </h2>
            <div className="flex items-end justify-between h-32 px-4">
              {stats.weeklyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="w-8 bg-blue-500 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${Math.max(4, (day.count / Math.max(...stats.weeklyData.map(d => d.count), 1)) * 100)}px` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{day.day}</div>
                  <div className="text-xs text-white">{day.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Agent is Live Widget Card */}
          <div className="rounded-lg p-6 mb-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                  Your agent is live
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Active</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-2">Widget Code</div>
                <div className="bg-gray-900 text-gray-100 px-3 py-2 rounded text-xs font-mono">
                  {`<script src="https://nexagent-one.vercel.app/widget.js" data-client="${user?.id}">`}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={copyWidgetCode}
                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
                style={{ background: '#6366f1', color: '#fff' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Code</span>
              </button>
              <Link href="/dashboard/install">
                <button className="px-4 py-2 rounded-lg font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                  View install guide →
                </button>
              </Link>
              <Link href={`/widget/${user?.id}`} target="_blank">
                <button className="px-4 py-2 rounded-lg font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                  Preview your agent →
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/dashboard/conversations">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="message" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Conversations</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  View all customer conversations
                </p>
              </div>
            </Link>

            <Link href="/dashboard/leads">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="target" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Leads</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Manage captured leads
                </p>
              </div>
            </Link>

            <Link href="/dashboard/agent">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="robot" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Edit Agent</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Customize your AI agent
                </p>
              </div>
            </Link>

            <Link href="/dashboard/install">
              <div className="rounded-lg p-6 hover:bg-opacity-50 transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="zap" size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <h3 className="font-semibold mb-2" style={{ color: '#fff' }}>Install Guide</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Get widget installation help
                </p>
              </div>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
