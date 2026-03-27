import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Icon from '@/components/Icon'

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [position, setPosition] = useState<number | null>(null)

  const businessTypes = [
    'E-commerce',
    'Education', 
    'Legal',
    'Restaurant',
    'Real Estate',
    'Other'
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          businessName,
          businessType,
          message
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSuccess(true)
      setPosition(data.position)
      setEmail('')
      setBusinessName('')
      setBusinessType('')
      setMessage('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Head><title>Waitlist — NexAgent</title></Head>
        
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}><Icon name="check" size={32} style={{color: 'white'}} /></div>
            
            <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Instrument Serif, serif' }}>
              You're #{position} on the waitlist!
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--t2)' }}>
              We'll email you at <strong>{email}</strong> within 48 hours.
            </p>
            <div className="text-sm space-y-2">
              <Link href="/demo" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                While you wait, try the live demo →
              </Link>
              <div>
                <Link href="/" className="font-medium hover:underline" style={{ color: 'var(--t2)' }}>
                  Back to homepage
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
      <Head><title>Waitlist — NexAgent</title></Head>
      
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
            {/* Badge */}
            <div className="text-center mb-6">
              <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                Limited spots available
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold mb-4 text-center" style={{ fontFamily: 'Instrument Serif, serif', letterSpacing: -1.5 }}>
              Get early access to<br />your AI agent.
            </h1>
            
            {/* Subtext */}
            <p className="text-center mb-6 leading-relaxed" style={{ color: 'var(--t2)' }}>
              We're onboarding businesses one by one — no IT department needed, live in 3 days. 
              Join the waitlist and we'll reach out within 48 hours with a custom demo built for your specific business.
            </p>

            {/* Trust strip */}
            <div className="flex justify-center gap-3 mb-8">
              {[
                <><Icon name="zap" size={14} /> Setup in 3 days</>,
                <><Icon name="bar-chart" size={14} /> From $99/month</>,
                <><Icon name="lock" size={14} /> No technical knowledge needed</>
              ].map((item, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'rgba(107,92,231,0.1)', color: 'var(--accent)', border: '1px solid rgba(107,92,231,0.2)' }}>
                  {item}
                </span>
              ))}
            </div>

            {/* Social proof */}
            <div className="text-center mb-8 text-sm" style={{ color: 'var(--t2)' }}>
              <Icon name="zap" size={14} /> 24 businesses already waiting
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="you@business.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Your Business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Select type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What's your biggest support challenge? <span className="text-xs" style={{ color: 'var(--t3)' }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 200))}
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-colors resize-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Tell us about your support challenges..."
                />
                <div className="text-xs mt-1" style={{ color: 'var(--t3)' }}>
                  {message.length}/200
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {loading ? 'Joining...' : 'Join the waitlist →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
