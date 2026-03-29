import { useEffect } from 'react'
import Head from 'next/head'

export default function DashboardRedirect() {
  useEffect(() => {
    window.location.href = '/onboarding'
  }, [])

  return (
    <>
      <Head>
        <title>Redirecting to NexAgent</title>
        <meta httpEquiv="refresh" content="0; url=/onboarding" />
      </Head>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a12',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Redirecting to create your AI agent...</h1>
          <p>If you're not redirected, <a href="/onboarding" style={{ color: '#6366f1' }}>click here</a>.</p>
        </div>
      </div>
    </>
  )
}
