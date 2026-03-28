import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'
import { SkeletonTable } from '@/components/Skeleton'

interface Lead {
  id: string
  created_at: string
  type: 'email' | 'phone'
  value: string
  source: string
  conversation_id?: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    emailCount: 0,
    phoneCount: 0
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch leads
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setLeads(leadsData || [])

      // Calculate stats
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const stats = {
        total: leadsData?.length || 0,
        thisWeek: leadsData?.filter((lead: any) => new Date(lead.created_at) > weekAgo).length || 0,
        thisMonth: leadsData?.filter((lead: any) => new Date(lead.created_at) > monthAgo).length || 0,
        emailCount: leadsData?.filter((lead: any) => lead.type === 'email').length || 0,
        phoneCount: leadsData?.filter((lead: any) => lead.type === 'phone').length || 0
      }
      
      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const filteredLeads = leads.filter(lead =>
      lead.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const csv = [
      ['Date', 'Value', 'Type', 'Source'],
      ...filteredLeads.map(lead => [
        new Date(lead.created_at).toLocaleDateString(),
        lead.value,
        lead.type,
        lead.source
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredLeads = leads.filter(lead =>
    lead.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout activeTab="leads">
        <div className="p-8">
          <SkeletonTable rows={5} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Leads - NexAgent Dashboard</title>
      </Head>

      <DashboardLayout activeTab="leads">
        <div className="p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Leads</span>
                <Icon name="target" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">This Week</span>
                <Icon name="bar-chart" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.thisWeek}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">This Month</span>
                <Icon name="clock" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats.thisMonth}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Email vs Phone</span>
                <Icon name="users" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-sm text-white">
                <span className="text-blue-400">{stats.emailCount}</span> / 
                <span className="text-green-400"> {stats.phoneCount}</span>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Captured Leads</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={exportToCSV}
                    disabled={filteredLeads.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Icon name="chevron-down" size={16} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="target" size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {leads.length === 0 ? 'No leads captured yet' : 'No leads match your search'}
                </h3>
                <p className="text-gray-400">
                  {leads.length === 0 
                    ? 'Your agent will automatically collect contact info from interested visitors'
                    : 'Try adjusting your search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Value</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-4 text-gray-300">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-white font-medium">
                          {lead.value}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.type === 'email' 
                              ? 'bg-blue-900 text-blue-300' 
                              : 'bg-green-900 text-green-300'
                          }`}>
                            {lead.type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">
                          {lead.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
