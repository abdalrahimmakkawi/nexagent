import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Icon from '@/components/Icon'
import DemoComponent from './demo'

const ParticleField = dynamic(
  () => import('@/components/ParticleField'),
  { ssr: false }
)

const TICKER_ITEMS = [
  'E-commerce Support', 'Legal Intake', 'EdTech Onboarding',
  'Hospitality Concierge', 'Lead Capture', 'Cart Recovery',
  'Returns Automation', 'Sentiment Analysis', '24/7 Coverage',
  '3-Day Setup',
]

const SERVICES = [
  { icon: 'store', title: 'E-commerce Support Agent', desc: 'Handles orders, returns, FAQs, and captures leads 24/7 without human touch.', features: ['Order tracking & shipping FAQ', 'Automated returns flow', 'Lead capture (email/SMS)', 'Cart abandonment recovery', 'Action-driven — resolves tickets end to end', 'No IT setup required'], featured: true },
  { icon: 'users', title: 'EdTech Onboarding Agent', desc: 'Guide students from first click to enrolled — answering questions and personalizing the journey.', features: ['Student intake & qualification', 'Course & pricing FAQ', 'Personalised recommendations', 'Progress check-ins', 'Works for 2-person teams or 10,000 students'] },
  { icon: 'shield', title: 'Legal Intake Agent', desc: 'Qualify leads 24/7, handle intake forms, book consultations automatically.', features: ['Case type qualification', 'Appointment scheduling', 'Document request automation', 'GDPR compliant', 'Live in 3 days — no technical knowledge needed'] },
  { icon: 'star', title: 'Hospitality Concierge', desc: 'A 24/7 digital concierge handling reservations, guest FAQ, and upsells.', features: ['Reservation management', 'Menu & availability FAQ', 'Automated review requests', 'Multi-language support', 'Self-serve demo available for your team'] },
]

const PRICING = [
  {
    name: 'Founders Program',
    price: '$199',
    billing: '/month · 6-month commitment',
    pop: true,
    desc: '🚀 Limited to first 10 clients only. Get all Growth features with $0 setup fee.',
    features: [
      '$0 setup fee (save $299)',
      'All Growth features included',
      'Early access to new features',
      'Case study participation',
      'Priority support',
      '3-day deployment guarantee',
      'Money-back if not live in 3 days',
      'Limited to first 10 clients',
    ],
  },
  {
    name: 'Starter',
    price: '$99',
    billing: '/month · cancel anytime',
    pop: false,
    desc: 'Perfect for businesses wanting to test AI with no setup risk.',
    features: [
      'No setup fee',
      '1 custom AI agent',
      'Up to 500 conversations/month',
      'Email support',
      'Standard analytics',
      '3-day deployment guarantee',
    ],
  },
  {
    name: 'Growth',
    price: '$199',
    billing: '/month · cancel anytime',
    pop: false,
    desc: 'For businesses ready to scale with AI operations.',
    features: [
      '$299 setup fee',
      '1–2 custom AI agents',
      'Up to 2,000 conversations/month',
      'Priority support (<4hr response)',
      'Advanced analytics',
      'Lead capture included',
      'Custom branding',
      '3-day deployment guarantee',
    ],
  },
  {
    name: 'Scale',
    price: '$499',
    billing: '/month · cancel anytime',
    pop: false,
    desc: 'Full AI operations suite for aggressive automation.',
    features: [
      '$499 setup fee',
      'Up to 5 custom agents',
      'Unlimited conversations',
      '24/7 phone support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      '3-day deployment guarantee',
    ],
  },
]

const FAQS = [
  {
    q: 'How is this different from tools like Glean or Intercom?',
    a: 'Enterprise tools like Glean start at $5,000/month and require an IT team to deploy. Intercom charges per seat and gets expensive fast. NexAgent is built specifically for small and mid-size businesses — transparent pricing from $99/month, setup in 3 days, and we handle everything for you.'
  },
  {
    q: 'How long does it take to deploy?',
    a: 'Typically 3 days from your initial call to a live agent on your site. We handle all the technical setup — you just answer questions about your business and approve before we go live.'
  },
  {
    q: 'Do I need technical knowledge or an IT team?',
    a: 'Zero. This is one of the key reasons businesses choose us over enterprise tools. You need no technical knowledge at all. We build it, deploy it, and maintain it for you.'
  },
  {
    q: 'What happens if the AI makes a mistake?',
    a: 'Our agents are designed to escalate complex issues to your team automatically. They can recognize when they don\'t have an answer and will hand off to a human with full context. You\'ll also have weekly performance reports to continuously improve accuracy.'
  },
  {
    q: 'Can I customize the AI agent for my business?',
    a: 'Absolutely. During the 30-minute strategy call, we\'ll map your specific workflows, brand voice, and business rules. The AI is trained on your actual support tickets, FAQs, and business processes.'
  },
  {
    q: 'What kind of results can I expect?',
    a: 'Our current clients see 94% of tickets resolved without human involvement, 60% reduction in support costs, and 3.2x ROI in the first month. But every business is different — we\'ll set realistic expectations based on your specific use case during the strategy call.'
  },
]

export default function UnifiedApp() {
  const [activeSection, setActiveSection] = useState('home')
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)
  const [demoBusiness, setDemoBusiness] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoSubmitted, setDemoSubmitted] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistEmail) return

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail })
      })

      if (response.ok) {
        setWaitlistSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit to waitlist:', error)
    }
  }

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoBusiness || !demoEmail) return

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: demoBusiness, email: demoEmail })
      })

      if (response.ok) {
        setDemoSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit demo request:', error)
    }
  }

  return (
    <>
      <Head>
        <title>NexAgent - Custom AI Agents for Small Business</title>
        <meta name="description" content="Custom AI agents deployed in 3 days. Handle customer support, lead capture, and more. From $99/month. No IT team required." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Announcement Banner */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#4338ca',
          color: 'white',
          fontSize: '13px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '0 16px'
        }}>
          <span style={{ textAlign: 'center' }}>
            🎯 Founding Client Program — 5 spots at $99/month forever.{' '}
            <button
              onClick={() => scrollToSection('pricing')}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '13px',
                padding: 0
              }}
            >
              Claim your spot →
            </button>
          </span>
          <button
            onClick={() => setShowBanner(false)}
            style={{
              position: 'absolute',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh'
      }}>
        {/* Navigation */}
        <nav style={{
          position: 'fixed',
          top: showBanner ? 40 : 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 18, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border)',
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link href="/" style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'var(--text)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ color: '#6366f1' }}>Nex</span>Agent
            </Link>
            
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32
          }}>
            {/* Desktop Navigation */}
            {!isMobile && [
              { id: 'home', label: 'Home' },
              { id: 'services', label: 'Services' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'demo', label: 'Demo' },
              { id: 'waitlist', label: 'Join Waitlist' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeSection === item.id ? '#6366f1' : 'var(--t2)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#6366f1'}
                onMouseOut={(e) => e.currentTarget.style.color = activeSection === item.id ? '#6366f1' : 'var(--t2)'}
              >
                {item.label}
              </button>
            ))}
          </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '80px 16px 40px' : '80px 24px 40px',
          position: 'relative'
        }}>
          <ParticleField />
          
          <div style={{
            maxWidth: 1200,
            width: '100%',
            textAlign: 'center',
            zIndex: 1
          }}>
            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              background: 'linear-gradient(135deg, #fff 0%, #c4baff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AI agents that actually
              <span style={{ color: '#6366f1', fontStyle: 'italic' }}> resolve tickets</span>
              <br />
              end to end.
            </h1>

            <p style={{
              fontSize: 18,
              color: 'var(--t2)',
              lineHeight: 1.6,
              marginBottom: 40,
              maxWidth: 600,
              margin: '0 auto 40px'
            }}>
              Custom AI agents for e-commerce and education businesses. 
              Deployed in 3 days, from $99/month. No IT team required.
            </p>

            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 48,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'center' : 'stretch'
            }}>
              <button
                onClick={() => scrollToSection('demo')}
                style={{
                  padding: '14px 32px',
                  background: '#6366f1',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                Try live demo →
              </button>
              
              <button
                onClick={() => scrollToSection('pricing')}
                style={{
                  padding: '14px 32px',
                  background: 'transparent',
                  color: 'var(--text)',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                View pricing
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {[
                { val: '94%', label: 'Resolution rate' },
                { val: '3 days', label: 'To go live' },
                { val: '$99', label: 'Starting price' }
              ].map(stat => (
                <div key={stat.label} style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#6366f1',
                    marginBottom: 4
                  }}>{stat.val}</div>
                  <div style={{ fontSize: 14, color: 'var(--t2)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" style={{
          padding: isMobile ? '80px 16px' : '80px 24px',
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#6366f1',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>SERVICES</div>
            <h2 style={{
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: 800,
              marginBottom: 24,
              lineHeight: 1.2
            }}>
              AI agents for every business need
            </h2>
            <p style={{ fontSize: 18, color: 'var(--t2)', maxWidth: 600, margin: '0 auto' }}>
              From e-commerce to education, we build custom AI solutions that handle your most important workflows.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32
          }}>
            {SERVICES.map((service, index) => (
              <div key={index} style={{
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 32,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <Icon name={service.icon as any} size={24} style={{ color: '#6366f1' }} />
                </div>
                
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: 'var(--text)'
                }}>{service.title}</h3>
                
                <p style={{
                  fontSize: 16,
                  color: 'var(--t2)',
                  lineHeight: 1.6,
                  marginBottom: 20
                }}>{service.desc}</p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {service.features.map((feature, i) => (
                    <li key={i} style={{
                      fontSize: 14,
                      color: 'var(--t2)',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <Icon name="check" size={16} style={{ color: '#22c55e' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{
          padding: isMobile ? '80px 16px' : '80px 24px',
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#6366f1',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>PRICING</div>
            <h2 style={{
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: 800,
              marginBottom: 24,
              lineHeight: 1.2
            }}>
              Start with a project. <em style={{ fontStyle: 'italic', color: '#c4baff' }}>Grow</em> on retainer.
            </h2>
            <p style={{ fontSize: 18, color: 'var(--t2)' }}>No surprise fees. Cancel anytime.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {PRICING.map((plan, index) => (
              <div key={index} style={{
                background: plan.pop ? 'linear-gradient(160deg,rgba(107,92,231,0.1),var(--s1) 60%)' : 'var(--s1)',
                border: `1px solid ${plan.pop ? 'rgba(107,92,231,0.4)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: 32,
                position: 'relative',
                transition: 'transform 0.2s'
              }}>
                {plan.pop && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#6366f1',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    Most Popular
                  </div>
                )}
                
                <h3 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text)'
                }}>{plan.name}</h3>
                
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: 'var(--text)'
                  }}>{plan.price}</span>
                  <span style={{
                    fontSize: 16,
                    color: 'var(--t2)'
                  }}>{plan.billing}</span>
                </div>
                
                <p style={{
                  fontSize: 16,
                  color: 'var(--t2)',
                  marginBottom: 24,
                  lineHeight: 1.5
                }}>{plan.desc}</p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 32px 0'
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{
                      fontSize: 14,
                      color: 'var(--t2)',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8
                    }}>
                      <Icon name="check" size={16} style={{ color: '#22c55e', marginTop: 2 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: plan.pop ? '#6366f1' : 'transparent',
                  color: plan.pop ? '#fff' : 'var(--text)',
                  border: `1px solid ${plan.pop ? '#6366f1' : 'var(--border)'}`,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" style={{
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          <DemoComponent />
        </section>

        {/* Waitlist Section */}
        <section id="waitlist" style={{
          padding: '80px 24px',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 40px)',
              fontWeight: 800,
              marginBottom: 24
            }}>
              Join the Waitlist
            </h2>
            
            <p style={{
              fontSize: 18,
              color: 'var(--t2)',
              lineHeight: 1.6
            }}>
              We're onboarding businesses one by one — no IT department needed, live in 3 days. 
              Join the waitlist and we'll reach out within 48 hours with a custom demo built for your specific business.
            </p>
          </div>

          {!waitlistSubmitted ? (
            <form onSubmit={handleWaitlistSubmit} style={{
              display: 'flex',
              gap: 16,
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'var(--s1)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 16,
                  color: 'var(--text)'
                }}
              />
              
              <button
                type="submit"
                style={{
                  padding: '16px 32px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 200
                }}
              >
                Join Waitlist
              </button>
            </form>
          ) : (
            <div style={{
              padding: 32,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 8,
              textAlign: 'center'
            }}>
              <Icon name="check" size={32} style={{ color: '#22c55e', marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
                You're on the list!
              </h3>
              <p style={{ color: 'var(--t2)' }}>
                We'll reach out within 48 hours with your custom demo.
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 32,
            flexWrap: 'wrap'
          }}>
            {[
              'Setup in 3 days',
              'From $99/month',
              'No technical knowledge needed'
            ].map((item, i) => (
              <span key={i} style={{
                fontSize: 12,
                padding: '8px 16px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 20,
                fontWeight: 600
              }}>
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{
          padding: '80px 24px',
          maxWidth: 800,
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 40px)',
              fontWeight: 800,
              marginBottom: 24
            }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {FAQS.map((faq, index) => (
              <div key={index} style={{
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 24
              }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: 'var(--text)'
                }}>{faq.q}</h3>
                <p style={{
                  fontSize: 16,
                  color: 'var(--t2)',
                  lineHeight: 1.6
                }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '48px 24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <span style={{ color: '#6366f1', fontSize: 20, fontWeight: 'bold' }}>Nex</span>
            <span style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--text)' }}>Agent</span>
          </div>
          
          <p style={{ color: 'var(--t2)', fontSize: 14 }}>
            © 2024 NexAgent. Custom AI agents for small business.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 16
          }}>
            <Link href="/admin" style={{
              color: 'var(--t2)',
              fontSize: 14,
              textDecoration: 'none'
            }}>
              Admin
            </Link>
          </div>
        </footer>
      </div>
    </>
  )
}
