import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Login — NexAgent</title></Head>
      
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
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--t2)' }}>Sign in to your NexAgent dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{ 
                  background: 'var(--s1)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text)' 
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: 'var(--t2)' }}>
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Create account
              </Link>
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--t2)' }}>
              Want to try first?{' '}
              <Link href="/demo" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Try the demo
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
