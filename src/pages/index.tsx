import { useEffect } from 'react'
import Head from 'next/head'

export default function IndexRedirect() {
  useEffect(() => {
    window.location.href = '/app'
  }, [])

  return (
    <>
      <Head>
        <title>NexAgent - Custom AI Agents for Small Business</title>
        <meta httpEquiv="refresh" content="0; url=/app" />
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
          <h1>Welcome to NexAgent</h1>
          <p>Redirecting to our unified experience...</p>
          <p>If you're not redirected, <a href="/app" style={{ color: '#6366f1' }}>click here</a>.</p>
        </div>
      </div>
    </>
  )
}
