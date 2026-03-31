import Head from 'next/head'
import Link from 'next/link'
import { getAdminContactEmail } from '@/lib/admin'

export default function ServerError() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Instrument Sans, sans-serif',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 120,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.06)',
        lineHeight: 1,
        marginBottom: 0,
      }}>500</div>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 36,
        color: '#eeeeff',
        marginBottom: 12,
        marginTop: -20,
        letterSpacing: -1,
      }}>Something went wrong</h1>
      <p style={{
        fontSize: 16,
        color: '#8888b8',
        marginBottom: 40,
        maxWidth: 400,
        lineHeight: 1.7,
      }}>
        We're having trouble on our end. 
        This has been logged and we're fixing it.
      </p>
      <Link href="/" style={{
        padding: '12px 24px',
        background: '#6366f1',
        color: '#fff',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 700,
      }}>Go home</Link>
      <p style={{ marginTop: 24, fontSize: 13, 
        color: '#3d3d60' }}>
        If this keeps happening, email 
        {getAdminContactEmail()}
      </p>
    </div>
  )
}
