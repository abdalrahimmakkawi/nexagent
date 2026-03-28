import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Custom500() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>500 - Server Error | NexAgent</title>
        <meta name="description" content="We're having trouble on our end. This has been logged and we're fixing it." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#07070d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif',
        color: 'white'
      }}>
        
        {/* Content */}
        <div style={{
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '80px',
            fontWeight: '700',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #dc2626 0%, #07070d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            500
          </div>
          
          <div style={{
            fontSize: '24px',
            fontWeight: '500',
            marginBottom: '32px',
            opacity: 0.9
          }}>
            Something went wrong
          </div>
          
          <div style={{
            fontSize: '18px',
            opacity: 0.7,
            marginBottom: '40px',
            lineHeight: 1.6
          }}>
            We're having trouble on our end. This has been logged and we're fixing it.
          </div>
          
          <div style={{
            marginBottom: '40px'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
            >
              Go home
            </button>
          </div>
          
          <div style={{
            fontSize: '14px',
            opacity: 0.6,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px'
          }}>
            If this keeps happening, email us at{' '}
            <a 
              href="mailto:abdalrahimmakkawi@gmail.com" 
              style={{
                color: '#60a5fa',
                textDecoration: 'underline'
              }}
            >
              abdalrahimmakkawi@gmail.com
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
