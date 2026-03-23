import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function Signup() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/dashboard'
      }
      setPageLoading(false)
    })
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
          }
        }
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
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

  if (success) {
    return (
      <>
        <Head><title>Check your email — NexAgent</title></Head>
        
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>✉️</div>
            
            <h1 className="text-2xl font-bold mb-4">Check your email</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--t2)' }}>
              We've sent a confirmation link to <strong>{email}</strong>. 
              Click the link to activate your account.
            </p>
            
            <div className="text-sm space-y-2">
              <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Back to sign in
              </Link>
              <div>
                <Link href="/demo" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                  Try the demo while you wait
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Sign up — NexAgent</title></Head>
      
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        {/* Logo */}
        <div className="flex justify-center pt-8 pb-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
            <span className="font-bold text-base text-white">NexAgent</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-sm" style={{ color: 'var(--t2)' }}>Start building AI agents for your business</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ 
                background: 'rgba(239,68,68,0.1)', 
                border: '1px solid rgba(239,68,68,0.3)', 
                color: '#f87171' 
              }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{ 
                  background: 'var(--s1)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text)' 
                }}
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{ 
                  background: 'var(--s1)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text)' 
                }}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{ 
                  background: 'var(--s1)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text)' 
                }}
                placeholder="••••••••"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: 'var(--t2)' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
