import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = '/login'
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg mx-auto mb-4 animate-spin"
            style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Dashboard — NexAgent</title></Head>
      
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Navigation */}
        <nav className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--s1)' }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
              <span className="font-bold text-base">NexAgent</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/demo" className="text-sm font-medium hover:underline" style={{ color: 'var(--t2)' }}>
                Demo
              </Link>
              <span className="text-sm" style={{ color: 'var(--t2)' }}>
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ 
                  color: 'var(--t2)', 
                  border: '1px solid var(--border)' 
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-lg" style={{ color: 'var(--t2)' }}>
              Your AI agent setup is in progress. We'll notify you within 24 hours once it's ready.
            </p>
          </div>

          {/* Status Card */}
          <div className="rounded-2xl p-8 mb-8" style={{ 
            background: 'linear-gradient(135deg,rgba(107,92,231,0.1),rgba(107,92,231,0.03))', 
            border: '1px solid rgba(107,92,231,0.25)' 
          }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'var(--accent)' }}>⚙️</div>
              <div>
                <h2 className="text-xl font-bold mb-1">Agent Setup in Progress</h2>
                <p className="text-sm" style={{ color: 'var(--t2)' }}>
                  We're configuring your AI agent with your business requirements
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--amber)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }}></div>
              Estimated completion: Within 24 hours
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl p-6" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold mb-2">0</div>
              <div className="text-sm" style={{ color: 'var(--t2)' }}>Total Conversations</div>
            </div>
            
            <div className="rounded-xl p-6" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold mb-2">0</div>
              <div className="text-sm" style={{ color: 'var(--t2)' }}>Leads Captured</div>
            </div>
            
            <div className="rounded-xl p-6" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold mb-2">0%</div>
              <div className="text-sm" style={{ color: 'var(--t2)' }}>Resolution Rate</div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="rounded-xl p-6" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-3">Need help?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--t2)' }}>
              Have questions about your agent setup or want to make changes? Our team is here to help.
            </p>
            <a
              href="mailto:hello@nexagent.io"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                background: 'var(--accent)', 
                color: 'white' 
              }}
            >
              Contact us →
            </a>
          </div>
        </main>
      </div>
    </>
  )
}
