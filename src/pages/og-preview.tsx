import type { NextApiRequest, NextApiResponse } from 'next'
import Head from 'next/head'

export default function OGPreview() {
  return (
    <>
      <Head>
        <title>OG Preview - NexAgent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#07070d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif',
        color: 'white'
      }}>
        <div style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #1e293b 0%, #07070d 100%)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            lineHeight: 1
          }}>
            NexAgent
          </div>
          
          <div style={{
            fontSize: '24px',
            fontWeight: '500',
            marginBottom: '32px',
            textAlign: 'center',
            opacity: 0.9
          }}>
            AI Agents for Growing Businesses
          </div>
          
          <div style={{
            display: 'flex',
            gap: '32px',
            fontSize: '18px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: 0.8
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>94%</div>
              <div>resolution rate</div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: 0.8
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>3 days</div>
              <div>setup time</div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: 0.8
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>$99</div>
              <div>monthly</div>
            </div>
          </div>
          
          <div style={{
            fontSize: '14px',
            opacity: 0.7,
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px'
          }}>
            1200 × 630 • Social Media Preview
          </div>
        </div>
      </div>
    </>
  )
}
