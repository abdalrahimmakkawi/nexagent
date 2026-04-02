import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'
import { ADMIN_EMAIL } from '@/lib/admin'

export default function AdminReview() {
  const router = useRouter()
  const { agentId } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [previewMessages, setPreviewMessages] = useState<any[]>([])
  const [previewInput, setPreviewInput] = useState('')
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false)
  const [moreInfoText, setMoreInfoText] = useState('')

  useEffect(() => {
  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      const adminEmail = ADMIN_EMAIL
      if (session.user.email !== adminEmail) {
        router.push('/login')
        return
      }
      
      // User is admin — allow access
      setUser(session.user)
      setLoading(false)
      
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }
  
  checkAdmin()
}, [router])

  useEffect(() => {
    if (agentId && user) {
      fetchAgent()
    }
  }, [agentId, user])

  const fetchAgent = async () => {
    try {
      const { data } = await supabase
        .from('agents')
        .select('*, clients(*)')
        .eq('id', agentId as string)
        .single()

      setAgent(data)
    } catch (err) {
      console.error('Failed to fetch agent:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveAgent = async () => {
    setSaving(true)
    try {
      await (supabase
        .from('agents') as any)
        .update({
          name: agent.name,
          system_prompt: agent.system_prompt,
          welcome_message: agent.welcome_message,
          quick_prompts: agent.quick_prompts,
          lead_message: agent.lead_message,
          widget_color: agent.widget_color,
          escalation_triggers: agent.escalation_triggers,
        })
        .eq('id', agentId as string)

      alert('Changes saved!')
    } catch (err) {
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const approveAgent = async () => {
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/approve-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ agentId }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Agent approved! Client has been notified.')
        router.push('/admin')
      } else {
        alert('Failed to approve: ' + result.error)
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const sendMoreInfoRequest = async () => {
    // This would trigger an n8n workflow to email the client
    setShowMoreInfoModal(false)
    setMoreInfoText('')
    alert('Request sent to client!')
  }

  const sendPreviewMessage = async () => {
    if (!previewInput.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: previewInput,
      created_at: new Date().toISOString(),
    }

    setPreviewMessages(prev => [...prev, userMessage])
    setPreviewInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: agent.welcome_message || "Hello! I'm here to help you.",
        created_at: new Date().toISOString(),
      }
      setPreviewMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  const updateEscalationTriggers = (newTriggers: string[]) => {
    setAgent({ ...agent, escalation_triggers: newTriggers })
  }

  const addEscalationTrigger = () => {
    const newTrigger = prompt('Enter escalation trigger:')
    if (newTrigger && newTrigger.trim()) {
      updateEscalationTriggers([...agent.escalation_triggers, newTrigger.trim()])
    }
  }

  if (loading) return <div>Loading...</div>

  if (!agent) return <div>Agent not found</div>

  return (
    <>
      <Head><title>Review Agent — NexAgent Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#0a0a12' }}>
        {/* Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Review Agent
            </h1>
            <button
              onClick={() => router.push('/admin')}
              className="text-sm px-4 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >
              ← Back to Admin
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Client Info Bar */}
          <div className="rounded-lg p-4 mb-8" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Client</p>
                <p className="font-semibold" style={{ color: '#fff' }}>
                  {agent.clients?.business_name || 'Unknown'} ({agent.clients?.email})
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Business type: {agent.clients?.business_type}
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" 
                  style={{ 
                    background: agent.status === 'pending_review' ? 'rgba(251,191,36,0.2)' : 'rgba(34,197,94,0.2)',
                    color: agent.status === 'pending_review' ? '#fbbf24' : '#22c55e'
                  }}>
                  {agent.status === 'pending_review' ? 'Pending Review' : agent.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - Agent Config Editor */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                Agent Configuration
              </h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  System Prompt
                </label>
                <textarea
                  value={agent.system_prompt}
                  onChange={(e) => setAgent({ ...agent, system_prompt: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border font-mono text-sm"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: '#fff',
                    minHeight: '300px'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Welcome Message
                </label>
                <input
                  type="text"
                  value={agent.welcome_message}
                  onChange={(e) => setAgent({ ...agent, welcome_message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Quick Prompts
                </label>
                {agent.quick_prompts?.map((prompt: string, index: number) => (
                  <input
                    key={index}
                    type="text"
                    value={prompt}
                    onChange={(e) => {
                      const newPrompts = [...agent.quick_prompts]
                      newPrompts[index] = e.target.value
                      setAgent({ ...agent, quick_prompts: newPrompts })
                    }}
                    className="w-full px-4 py-2 rounded-lg border mb-2"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Lead Message
                </label>
                <input
                  type="text"
                  value={agent.lead_message}
                  onChange={(e) => setAgent({ ...agent, lead_message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Widget Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={agent.widget_color}
                    onChange={(e) => setAgent({ ...agent, widget_color: e.target.value })}
                    className="w-16 h-10 rounded border"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                  <input
                    type="text"
                    value={agent.widget_color}
                    onChange={(e) => setAgent({ ...agent, widget_color: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg border"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Escalation Triggers
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {agent.escalation_triggers?.map((trigger: string, index: number) => (
                    <div
                      key={index}
                      className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      {trigger}
                      <button
                        onClick={() => {
                          const newTriggers = agent.escalation_triggers.filter((_: string, i: number) => i !== index)
                          updateEscalationTriggers(newTriggers)
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addEscalationTrigger}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                >
                  + Add Trigger
                </button>
              </div>

              <button
                onClick={saveAgent}
                disabled={saving}
                className="w-full px-6 py-3 rounded-lg font-semibold"
                style={{ background: '#6366f1', color: '#fff' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* RIGHT COLUMN - Live Chat Preview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                  Live Preview
                </h2>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Testing as: {agent.name}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: agent.widget_color || '#6366f1', color: '#fff' }}>
                      {agent.name?.[0] || 'A'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: '#fff' }}>{agent.name}</div>
                      <div className="text-xs" style={{ color: '#22c55e' }}>Online</div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {previewMessages.length === 0 && (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <p className="mb-4">{agent.welcome_message}</p>
                      <p className="text-sm">Send a message to test the agent...</p>
                    </div>
                  )}
                  {previewMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs ${
                          msg.role === 'user'
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                        style={{
                          background: msg.role === 'user' ? agent.widget_color || '#6366f1' : 'rgba(255,255,255,0.9)'
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={previewInput}
                      onChange={(e) => setPreviewInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendPreviewMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-lg border"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <button
                      onClick={sendPreviewMessage}
                      className="px-4 py-2 rounded-lg"
                      style={{ background: agent.widget_color || '#6366f1', color: '#fff' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewMessages([])}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              >
                Refresh Preview
              </button>
            </div>
          </div>

          {/* BOTTOM - Action Bar */}
          <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Ready to deploy this agent?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMoreInfoModal(true)}
                  className="px-6 py-3 rounded-lg font-semibold border"
                  style={{ 
                    background: 'transparent', 
                    color: 'rgba(255,255,255,0.8)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  Request More Info
                </button>
                <button
                  onClick={approveAgent}
                  className="px-6 py-3 rounded-lg font-semibold"
                  style={{ background: '#22c55e', color: '#fff' }}
                >
                  Approve & Deploy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* More Info Modal */}
        {showMoreInfoModal && (
          <div className="fixed inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="rounded-lg p-6 max-w-md w-full" style={{ background: '#0a0a12', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#fff' }}>Request More Information</h3>
              <textarea
                value={moreInfoText}
                onChange={(e) => setMoreInfoText(e.target.value)}
                placeholder="What additional information do you need from the client?"
                className="w-full px-4 py-3 rounded-lg border mb-4"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#fff',
                  minHeight: '120px'
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMoreInfoModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={sendMoreInfoRequest}
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{ background: '#6366f1', color: '#fff' }}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
