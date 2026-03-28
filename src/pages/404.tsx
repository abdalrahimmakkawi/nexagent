import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>404 - Page Not Found | NexAgent</title>
        <meta name="description" content="The page you're looking for has been moved or never existed." />
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
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Particle Field Background */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.3
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
        
        {/* Navigation */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          zIndex: 10
        }}>
          <div 
            onClick={() => router.push('/')}
            style={{
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
            >
              ← NexAgent
            </div>
        </div>
        
        {/* Content */}
        <div style={{
          textAlign: 'center',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '120px',
            fontWeight: '700',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #1e293b 0%, #07070d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            404
          </div>
          
          <div style={{
            fontSize: '24px',
            fontWeight: '500',
            marginBottom: '32px',
            opacity: 0.9
          }}>
            This page doesn't exist
          </div>
          
          <div style={{
            fontSize: '18px',
            opacity: 0.7,
            marginBottom: '40px',
            maxWidth: '400px',
            lineHeight: 1.6
          }}>
            The page you're looking for has been moved or never existed.
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
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
                transition: 'all 0.2s'
              }}
            >
              Go home
            </button>
            
            <button
              onClick={() => window.open('/demo', '_blank')}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Try demo
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
