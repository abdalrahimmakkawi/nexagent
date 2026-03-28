import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        setUser(session.user)
        setLoading(false)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#07070d',
        color: '#8888b8',
        fontFamily: 'Instrument Sans, sans-serif',
        fontSize: 14
      }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard — NexAgent</title>
      </Head>
      
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        {/* Navigation */}
        <div className="flex justify-center pt-8 pb-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
            <span className="font-bold text-base text-white">NexAgent</span>
          </Link>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-sm" style={{ color: 'var(--t2)' }}>
              You're successfully logged in to your NexAgent dashboard.
            </p>
            
            <div className="space-y-4">
              <Link href="/dashboard/agent" className="block p-4 rounded-lg text-center transition-all hover:bg-gray-800" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold mb-2">My Agent</h3>
                <p className="text-sm">Configure and manage your AI agent</p>
              </Link>
              
              <Link href="/dashboard/conversations" className="block p-4 rounded-lg text-center transition-all hover:bg-gray-800" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold mb-2">Conversations</h3>
                <p className="text-sm">View chat history and interactions</p>
              </Link>
              
              <Link href="/dashboard/leads" className="block p-4 rounded-lg text-center transition-all hover:bg-gray-800" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold mb-2">Leads</h3>
                <p className="text-sm">Manage captured leads and prospects</p>
              </Link>
              
              <Link href="/dashboard/billing" className="block p-4 rounded-lg text-center transition-all hover:bg-gray-800" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold mb-2">Billing</h3>
                <p className="text-sm">Subscription and payment management</p>
              </Link>
              
              <Link href="/dashboard/install" className="block p-4 rounded-lg text-center transition-all hover:bg-gray-800" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold mb-2">Install Widget</h3>
                <p className="text-sm">Get code for your website</p>
              </Link>
            </div>
            
            <div className="mt-6">
              <Link href="/logout" className="text-sm text-gray-400 hover:text-gray-300">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
