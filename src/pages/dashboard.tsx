import { useEffect } from 'react'
import Head from 'next/head'

export default function DashboardRedirect() {
  useEffect(() => {
    window.location.href = '/app#pricing'
  }, [])

  return (
    <>
      <Head>
        <title>Redirecting to NexAgent</title>
        <meta httpEquiv="refresh" content="0; url=/app#pricing" />
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
          <h1>Redirecting to NexAgent...</h1>
          <p>If you're not redirected, <a href="/app#pricing" style={{ color: '#6366f1' }}>click here</a>.</p>
        </div>
      </div>
    </>
  )
}
