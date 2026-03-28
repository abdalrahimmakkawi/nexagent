import Link from 'next/link'

export default function NotFound() {
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
      }}>404</div>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 36,
        color: '#eeeeff',
        marginBottom: 12,
        marginTop: -20,
        letterSpacing: -1,
      }}>Page not found</h1>
      <p style={{
        fontSize: 16,
        color: '#8888b8',
        marginBottom: 40,
        maxWidth: 400,
        lineHeight: 1.7,
      }}>
        The page you're looking for has been moved 
        or never existed.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/" style={{
          padding: '12px 24px',
          background: '#6366f1',
          color: '#fff',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 700,
        }}>Go home</Link>
        <Link href="/demo" style={{
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#eeeeff',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 600,
        }}>Try the demo</Link>
      </div>
    </div>
  )
}
