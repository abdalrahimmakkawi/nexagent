import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'
import { SkeletonTable } from '@/components/Skeleton'

interface Conversation {
  id: string
  created_at: string
  message_count: number
  status: 'active' | 'resolved' | 'escalated'
  lead_captured: boolean
  ended_at?: string
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
    created_at: string
    provider?: string
  }>
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'resolved' | 'escalated' | 'active'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchConversations()
  }, [filter, page])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('conversations')
        .select(`
          *,
          messages(id, role, content, created_at, provider)
        `, { count: 'exact' })
        .eq('client_id', supabase.auth.getUser().then(({ data }) => data.user?.id))
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, count, error } = await query

      if (error) throw error
      
      setConversations(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      escalated: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="conversations">
        <div className="p-8">
          <SkeletonTable rows={5} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Conversations - NexAgent Dashboard</title>
      </Head>

      <DashboardLayout activeTab="conversations">
        <div className="p-8">
          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg" style={{ background: '#0d0d18' }}>
            {(['all', 'active', 'resolved', 'escalated'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="message" size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#fff' }}>
                No conversations yet
              </h3>
              <p className="text-gray-400 mb-6">
                Share your widget link to get started
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/install'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Get widget code →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  {/* Conversation Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-sm text-gray-400">
                          {getRelativeTime(conversation.created_at)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                            {conversation.message_count} messages
                          </span>
                          {conversation.lead_captured && (
                            <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                              Lead captured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(conversation.status)}
                      <button
                        onClick={() => toggleExpanded(conversation.id)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                      >
                        {expandedId === conversation.id ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Messages */}
                  {expandedId === conversation.id && conversation.messages && (
                    <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
                      {conversation.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-100'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            {message.role === 'assistant' && message.provider && (
                              <div className="text-xs mt-2 opacity-70">
                                ◆ {message.provider}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalCount > 20 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-300">
                      Page {page} of {Math.ceil(totalCount / 20)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalCount / 20)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  )
}
