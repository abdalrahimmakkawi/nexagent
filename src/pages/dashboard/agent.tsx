import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { fireWebhook } from '@/lib/webhooks'
import Icon from '@/components/Icon'
import { SkeletonTable } from '@/components/Skeleton'

interface Agent {
  id: string
  name: string
  welcome_message: string
  quick_prompts: string[]
  lead_field: string
  lead_message: string
  widget_color: string
  widget_position: string
  status: string
}

export default function AgentPage() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    welcome_message: '',
    quick_prompts: ['', '', '', '', ''],
    lead_field: 'email',
    lead_message: '',
    widget_color: '#6366f1',
    widget_position: 'bottom-right'
  })

  const toneOptions = [
    { value: 'Professional and formal', label: 'Professional and Formal' },
    { value: 'Friendly and casual', label: 'Friendly and Casual' },
    { value: 'Technical and precise', label: 'Technical and Precise' },
    { value: 'Empathetic and supportive', label: 'Empathetic and Supportive' },
    { value: 'Enthusiastic and energetic', label: 'Enthusiastic and Energetic' },
    { value: 'Concise and direct', label: 'Concise and Direct' }
  ]

  const positionOptions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' }
  ]

  useEffect(() => {
    fetchAgent()
  }, [])

  const fetchAgent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('client_id', user.id)
        .single()

      if (error) throw error
      
      if (data) {
        setAgent(data)
        setFormData({
          name: (data as any).name || '',
          welcome_message: (data as any).welcome_message || '',
          quick_prompts: (data as any).quick_prompts || ['', '', '', '', ''],
          lead_field: (data as any).lead_field || 'email',
          lead_message: (data as any).lead_message || '',
          widget_color: (data as any).widget_color || '#6366f1',
          widget_position: (data as any).widget_position || 'bottom-right'
        })
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!agent) return

    try {
      setSaving(true)
      setSaveMessage('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update agent with changes
      const response = await (supabase
        .from('agents') as any)
        .update({
          name: formData.name,
          welcome_message: formData.welcome_message,
          quick_prompts: formData.quick_prompts.filter(p => p.trim()),
          lead_field: formData.lead_field,
          lead_message: formData.lead_message,
          widget_color: formData.widget_color,
          widget_position: formData.widget_position,
          status: 'pending_review', // Changes require review
          updated_at: new Date().toISOString()
        })
        .eq('id', (agent as any).id)

      console.log('Agent update response:', response)

      if (response.error) throw response.error

      // Fire webhook to notify admin
      await fireWebhook('webhook/agent-generated', {
        event: 'agent.generated',
        clientId: user.id,
        businessName: formData.name,
        agentName: formData.name,
        agentId: (agent as any).id,
        businessType: 'AI Agent',
        reviewUrl: `https://nexagent-one.vercel.app/admin/review/${(agent as any).id}`,
        timestamp: new Date().toISOString()
      })

      setSaveMessage('Changes saved — pending review. We\'ll notify you within 24 hours.')
      
      // Re-fetch agent data from database to ensure fresh state
      await fetchAgent()

    } catch (error) {
      console.error('Failed to save agent:', error)
      setSaveMessage('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateQuickPrompt = (index: number, value: string) => {
    const newPrompts = [...formData.quick_prompts]
    newPrompts[index] = value
    setFormData({ ...formData, quick_prompts: newPrompts })
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="agent">
        <div className="p-8">
          <SkeletonTable rows={3} />
        </div>
      </DashboardLayout>
    )
  }

  if (!agent) {
    return (
      <DashboardLayout activeTab="agent">
        <div className="p-8">
          <div className="text-center">
            <Icon name="robot" size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
            <h3 className="text-xl font-semibold text-white mb-4">No agent found</h3>
            <p className="text-gray-400">Complete onboarding to create your AI agent</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Your Agent - NexAgent Dashboard</title>
      </Head>

      <DashboardLayout activeTab="agent">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Agent — {formData.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : agent.status === 'pending_review'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status === 'active' ? 'Active' : 
                     agent.status === 'pending_review' ? 'Pending Review' : 
                     agent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Editable Fields */}
            <div className="space-y-6">
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Prompts */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quick Prompts (up to 5)
                </label>
                <div className="space-y-2">
                  {formData.quick_prompts.map((prompt, index) => (
                    <input
                      key={index}
                      type="text"
                      value={prompt}
                      onChange={(e) => updateQuickPrompt(index, e.target.value)}
                      placeholder={`Quick prompt ${index + 1}`}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                  ))}
                </div>
              </div>

              {/* Lead Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lead Capture Field
                </label>
                <select
                  value={formData.lead_field}
                  onChange={(e) => setFormData({ ...formData, lead_field: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              {/* Lead Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lead Capture Message
                </label>
                <textarea
                  value={formData.lead_message}
                  onChange={(e) => setFormData({ ...formData, lead_message: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Widget Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Widget Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.widget_color}
                    onChange={(e) => setFormData({ ...formData, widget_color: e.target.value })}
                    className="h-10 w-20 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.widget_color}
                    onChange={(e) => setFormData({ ...formData, widget_color: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Widget Position */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Widget Position
                </label>
                <select
                  value={formData.widget_position}
                  onChange={(e) => setFormData({ ...formData, widget_position: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  {positionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div>
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <Icon name="refresh" size={14} />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="p-4">
                  <iframe
                    src={`/widget/${supabase.auth.getUser().then(({ data }) => data.user?.id)}`}
                    className="w-full h-96 rounded-lg border border-gray-600"
                    style={{ minHeight: '400px' }}
                  />
                </div>
                <div className="p-4 border-t border-gray-700">
                  <a
                    href={`/widget/${supabase.auth.getUser().then(({ data }) => data.user?.id)}`}
                    target="_blank"
                    className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Preview on your site →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="mb-4">
                <p className="text-sm text-gray-400">
                  <strong>Important:</strong> Changes will be reviewed before going live to ensure quality. Usually within 24 hours.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                
                {saveMessage && (
                  <div className={`text-sm ${
                    saveMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {saveMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
