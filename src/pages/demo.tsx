// src/pages/demo.tsx
import { useState } from 'react'
import { useEffect } from 'react'
import Head from 'next/head'

export default function DemoRedirect() {
  useEffect(() => {
    window.location.href = '/app'
  }, [])

  return (
    <>
      <Head>
        <title>Redirecting to NexAgent Demo</title>
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
          <h1>Redirecting to NexAgent Demo...</h1>
          <p>If you're not redirected, <a href="/app" style={{ color: '#6366f1' }}>click here</a>.</p>
        </div>
      </div>
    </>
  )
}
