// src/pages/index.tsx
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const SERVICES = [
  { icon: '🛍️', title: 'E-commerce Support Agent', desc: 'Handles orders, returns, FAQs, and captures leads 24/7 without human touch.', features: ['Order tracking & shipping FAQ', 'Automated returns flow', 'Lead capture (email/SMS)', 'Cart abandonment recovery', 'Action-driven — resolves tickets end to end', 'No IT setup required'], featured: true },
  { icon: '🎓', title: 'EdTech Onboarding Agent', desc: 'Guide students from first click to enrolled — answering questions and personalizing the journey.', features: ['Student intake & qualification', 'Course & pricing FAQ', 'Personalised recommendations', 'Progress check-ins', 'Works for 2-person teams or 10,000 students'] },
  { icon: '⚖️', title: 'Legal Intake Agent', desc: 'Qualify leads 24/7, handle intake forms, book consultations automatically.', features: ['Case type qualification', 'Appointment scheduling', 'Document request automation', 'GDPR compliant', 'Live in 3 days — no technical knowledge needed'] },
  { icon: '🏨', title: 'Hospitality Concierge', desc: 'A 24/7 digital concierge handling reservations, guest FAQ, and upsells.', features: ['Reservation management', 'Menu & availability FAQ', 'Automated review requests', 'Multi-language support', 'Self-serve demo available for your team'] },
]

const STEPS = [
  { num: '01', icon: '🔍', title: '30-min strategy call', desc: 'We map your top support tickets, lead funnel, and business goals. No technical knowledge needed.', tag: 'Day 1' },
  { num: '02', icon: '⚙️', title: 'Agent design & training', desc: 'We build your agent, train it on your brand voice and policies. You review before launch.', tag: 'Days 2–4' },
  { num: '03', icon: '🚀', title: 'Deploy & monitor', desc: 'Your agent goes live on your site. We monitor, tune, and send weekly performance reports.', tag: 'Day 5+' },
]

const RESULTS = [
  { val: '94%', label: 'Average ticket resolution rate without human involvement', color: 'var(--green)' },
  { val: '60%', label: 'Reduction in support staffing costs within 90 days', color: 'var(--amber)' },
  { val: '3.2×', label: 'Average ROI in the first month of deployment', color: '#c4baff' },
  { val: '24/7', label: 'Always-on coverage. Zero sick days, zero overtime.', color: 'var(--text)' },
]

const PRICING = [
  {
    name: 'Starter',
    price: '$499',
    billing: 'one-time setup fee',
    pop: false,
    desc: 'Test AI in your business before committing. Full agent, no strings attached.',
    features: [
      'Full custom AI agent build',
      'Up to 3 integrations',
      '30 days free support',
      'Handoff documentation',
      'Free migration to Growth plan',
      'Setup in 3 days — we handle everything',
    ],
  },
  {
    name: 'Growth',
    price: '$299',
    billing: '/month · cancel anytime',
    pop: true,
    desc: 'For businesses ready to run AI as a permanent part of their operations.',
    features: [
      '1–2 agents built & maintained',
      'Monthly performance tuning',
      'Weekly analytics reports',
      'Priority support (<4hr response)',
      'Unlimited conversations',
      'Lead capture included',
      'Works for teams of 2 or 200',
    ],
  },
  {
    name: 'Scale',
    price: '$799',
    billing: '/month · cancel anytime',
    pop: false,
    desc: 'Full AI operations suite for businesses that want to automate aggressively.',
    features: [
      'Up to 5 custom agents',
      'CRM & tool integrations',
      'Custom analytics dashboard',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label option',
      'Self-serve demo for your clients',
    ],
  },
]

const COMPARISON = [
  {
    them: 'Opaque pricing — "contact sales"',
    us: 'Transparent pricing from $299/month'
  },
  {
    them: 'Requires IT department to deploy',
    us: 'We set it up for you in 3 days'
  },
  {
    them: '$5,000+/month minimum contract',
    us: 'Starts at $499 one-time or $299/month'
  },
  {
    them: 'Search-first — still need humans to act',
    us: 'Action-driven — resolves tickets end to end'
  },
  {
    them: 'Minimum 100 users required',
    us: 'Works for a team of 2 or 200'
  },
  {
    them: 'Slow quote-based sales cycle',
    us: 'Self-serve demo — try it in 30 seconds'
  },
  {
    them: 'Months to go live',
    us: 'Live in under a week, guaranteed'
  },
]

const FAQS = [
  {
    q: 'How is this different from tools like Glean or Intercom?',
    a: 'Enterprise tools like Glean start at $5,000/month and require an IT team to deploy. Intercom charges per seat and gets expensive fast. NexAgent is built specifically for small and mid-size businesses — transparent pricing from $299/month, setup in 3 days, and we handle everything for you.'
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
    q: 'What if the agent says something wrong?',
    a: 'We build in guardrails and test extensively before launch. Post-launch monitoring catches edge cases within 24 hours. Every agent also has a built-in human escalation flow as a safety net.'
  },
  {
    q: 'Does it work for small teams?',
    a: 'Yes — in fact most of our clients are teams of 2 to 20 people. Unlike enterprise tools that require 100+ user minimums, NexAgent works for any business size. A 2-person e-commerce store gets the same AI power as a 500-person company.'
  },
  {
    q: 'What happens if I want to cancel?',
    a: 'No lock-in. Cancel anytime with 30 days notice. All code, documentation, and configurations stay yours — you own everything we build.'
  },
]

function Btn({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] transition-all no-underline ${primary ? 'text-white' : ''}`}
      style={primary
        ? { background: 'var(--accent)', boxShadow: '0 0 40px rgba(107,92,231,0.3)', color: 'white' }
        : { border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', background: 'transparent' }}>
      {children}
    </Link>
  )
}

export default function Home() {
  const revealRefs = useRef<HTMLElement[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).style.opacity = '1', (e.target as HTMLElement).style.transform = 'translateY(0)' }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    revealRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  function reveal(el: HTMLElement | null) {
    if (el) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(24px)'
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      revealRefs.current.push(el)
    }
  }

  return (
    <>
      <Head><title>NexAgent — AI Agents for Growing Businesses</title></Head>

      {/* BG glows */}
      <div className="fixed pointer-events-none z-0" style={{ width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,92,231,0.1) 0%,transparent 70%)', top: -200, right: -200 }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(61,255,160,0.05) 0%,transparent 70%)', bottom: 100, left: -100 }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10" style={{ height: 64, borderBottom: '1px solid var(--border)', background: 'rgba(7,7,13,0.88)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
          <span className="font-bold text-base text-white">NexAgent</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {['#how', '#services', '#results', '#pricing'].map(h => (
            <a key={h} href={h} className="text-sm no-underline transition-colors" style={{ color: 'var(--t2)' }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--t2)')}>
              {h.replace('#', '').charAt(0).toUpperCase() + h.replace('#', '').slice(1)}
            </a>
          ))}
          <Link href="/demo" className="text-sm no-underline transition-colors" style={{ color: 'var(--t2)' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--t2)')}>
            Demo
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Btn href="/demo">See Demo</Btn>
          <Btn href="/login">Login</Btn>
          <Btn href="/waitlist" primary>Get Started →</Btn>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO */}
        <section className="min-h-screen flex items-center justify-center text-center px-6" style={{ paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ maxWidth: 860 }}>
            <div className="inline-flex items-center gap-2 rounded-full text-xs font-bold tracking-wider uppercase mb-9" style={{ background: 'rgba(107,92,231,0.1)', border: '1px solid rgba(107,92,231,0.25)', color: '#c4baff', padding: '6px 16px', animation: 'fadeUp 0.6s ease both' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
              Now accepting Q2 clients
            </div>
            <h1 className="font-serif leading-none mb-6" style={{ fontSize: 'clamp(52px,7vw,88px)', letterSpacing: -2, animation: 'fadeUp 0.6s 0.1s ease both' }}>
              AI agents that<br />run your <em style={{ fontStyle: 'italic', color: '#c4baff' }}>support,</em><br />
              <span style={{ color: 'var(--t3)' }}>while you sleep.</span>
            </h1>
            <p className="text-lg mb-12 mx-auto" style={{ color: 'var(--t2)', maxWidth: 540, lineHeight: 1.7, animation: 'fadeUp 0.6s 0.2s ease both' }}>
              We build, deploy, and maintain custom AI agents for e-commerce and education businesses — cutting support costs by 60% and capturing leads 24/7.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-16" style={{ animation: 'fadeUp 0.6s 0.3s ease both' }}>
              <Btn href="/demo" primary>↗ Try Live Demo</Btn>
              <Btn href="#pricing">View Pricing</Btn>
            </div>
            <div className="flex items-center justify-center gap-8 flex-wrap text-sm" style={{ color: 'var(--t2)', animation: 'fadeUp 0.6s 0.4s ease both' }}>
              {['⚡ Live in 3 days — we handle setup', '🎯 94% ticket resolution rate', '💰 From $299/month', '🔒 No IT department needed', '👥 Works for teams of 2 or 200', '� Self-serve demo — no signup needed'].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="px-6 pb-32">
          <div ref={reveal} className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>Process</div>
            <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(36px,4vw,54px)', letterSpacing: -1 }}>From call to <em style={{ fontStyle: 'italic', color: '#c4baff' }}>live agent</em><br />in under a week</h2>
            <p className="text-lg mx-auto" style={{ color: 'var(--t2)', maxWidth: 480, lineHeight: 1.7 }}>We handle everything. You just answer a few questions about your business.</p>
          </div>
          <div ref={reveal} className="grid grid-cols-1 md:grid-cols-3 mx-auto overflow-hidden rounded-2xl" style={{ maxWidth: 1000, gap: 2, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {STEPS.map(s => (
              <div key={s.num} className="p-9 transition-colors" style={{ background: 'var(--s1)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--s2)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--s1)')}>
                <div className="text-xs font-mono mb-4" style={{ color: 'var(--accent2)', letterSpacing: '0.1em' }}>{s.num} / {s.title.split(' ')[0]}</div>
                <div className="text-3xl mb-4">{s.icon}</div>
                <div className="font-bold text-base mb-2.5">{s.title}</div>
                <div className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--t2)' }}>{s.desc}</div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{ background: 'rgba(107,92,231,0.1)', border: '1px solid rgba(107,92,231,0.2)', color: '#c4baff' }}>{s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="px-6 pb-32">
          <div ref={reveal} className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>Services</div>
            <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(36px,4vw,54px)', letterSpacing: -1 }}>Every agent built for<br /><em style={{ fontStyle: 'italic', color: '#c4baff' }}>one job.</em> Done perfectly.</h2>
          </div>
          <div ref={reveal} className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto" style={{ maxWidth: 1100 }}>
            {SERVICES.map(s => (
              <div key={s.title} className="relative rounded-2xl p-9 transition-all"
                style={{ background: s.featured ? 'linear-gradient(135deg,rgba(107,92,231,0.1),rgba(107,92,231,0.03))' : 'var(--s1)', border: `1px solid ${s.featured ? 'rgba(107,92,231,0.3)' : 'var(--border)'}` }}>
                {s.featured && <span className="absolute top-6 right-6 text-[10px] font-bold px-2.5 py-1 rounded-md text-white" style={{ background: 'var(--accent)' }}>Most Popular</span>}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: 'var(--s3)' }}>{s.icon}</div>
                <h3 className="text-xl font-bold mb-2.5" style={{ letterSpacing: -0.3 }}>{s.title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--t2)' }}>{s.desc}</p>
                <div className="flex flex-col gap-2">
                  {s.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--t2)' }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent2)' }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RESULTS */}
        <section id="results" className="px-6 pb-32">
          <div ref={reveal} className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>Results</div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(36px,4vw,54px)', letterSpacing: -1 }}>Numbers that make <em style={{ fontStyle: 'italic', color: '#c4baff' }}>CFOs smile</em></h2>
          </div>
          <div ref={reveal} className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto" style={{ maxWidth: 1100 }}>
            {RESULTS.map(r => (
              <div key={r.label} className="rounded-2xl p-7 text-center" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <div className="font-serif mb-2" style={{ fontSize: 48, letterSpacing: -2, lineHeight: 1, color: r.color }}>{r.val}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--t2)' }}>{r.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY NEXAGENT */}
        <section id="why-nexagent" className="px-6 pb-32">
          <div ref={reveal} className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>Why NexAgent</div>
            <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(36px,4vw,54px)', letterSpacing: -1 }}>
              Everything enterprise AI does.<br />None of the enterprise headaches.
            </h2>
            <p style={{ color: 'var(--t2)' }}>
              Tools like Glean charge $5,000/month minimum and require an IT department to set up. 
              We built the same power for businesses that actually need to watch their costs.
            </p>
          </div>
          <div ref={reveal} className="mx-auto" style={{ maxWidth: 800 }}>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--border)' }}>
                <div className="p-6 text-center" style={{ background: 'var(--s1)' }}>
                  <div className="text-sm font-bold mb-4" style={{ color: 'var(--t2)' }}>Enterprise AI (e.g. Glean)</div>
                </div>
                <div className="p-6 text-center" style={{ background: 'var(--s1)' }}>
                  <div className="text-sm font-bold mb-4" style={{ color: 'var(--accent)' }}>NexAgent ✦</div>
                </div>
              </div>
              {COMPARISON.map((item, i) => (
                <div key={i} className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--s1)' }}>
                  <div className="p-4 text-sm" style={{ color: 'var(--t2)' }}>
                    <span style={{ color: '#ef4444' }}>✗</span> {item.them}
                  </div>
                  <div className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {item.us}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="px-6 pb-32">
          <div ref={reveal} className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>Pricing</div>
            <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(36px,4vw,54px)', letterSpacing: -1 }}>Start with a project.<br /><em style={{ fontStyle: 'italic', color: '#c4baff' }}>Grow</em> on retainer.</h2>
            <p style={{ color: 'var(--t2)' }}>No surprise fees. Cancel anytime.</p>
          </div>
          <div ref={reveal} className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto" style={{ maxWidth: 900 }}>
            {PRICING.map(p => (
              <div key={p.name} className="relative rounded-2xl p-8 transition-colors"
                style={{ background: p.pop ? 'linear-gradient(160deg,rgba(107,92,231,0.1),var(--s1) 60%)' : 'var(--s1)', border: `1px solid ${p.pop ? 'rgba(107,92,231,0.4)' : 'var(--border)'}`, boxShadow: p.pop ? '0 0 60px rgba(107,92,231,0.1)' : 'none' }}>
                {p.pop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full text-white whitespace-nowrap" style={{ background: 'var(--accent)' }}>Most Popular</div>}
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--t2)' }}>{p.name}</div>
                <div className="font-serif mb-1" style={{ fontSize: 44, letterSpacing: -2, lineHeight: 1 }}>{p.price}</div>
                <div className="text-xs mb-6" style={{ color: 'var(--t3)' }}>{p.billing}</div>
                <div className="text-sm mb-6 pb-6 leading-relaxed" style={{ color: 'var(--t2)', borderBottom: '1px solid var(--border)' }}>{p.desc}</div>
                <div className="flex flex-col gap-2.5 mb-7">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--t2)' }}>
                      <span style={{ color: 'var(--green)', marginTop: 1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={p.pop
                    ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 24px rgba(107,92,231,0.3)' }
                    : { background: 'var(--s3)', color: 'var(--text)' }}>
                  {p.pop ? 'Get started →' : 'Book a call →'}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--t3)', lineHeight: 1.7 }}>
            All plans include a free 30-min strategy call · 
            No hidden setup fees · API costs included in 
            monthly plans · Cancel anytime
          </p>
        </section>

        {/* CTA */}
        <section id="contact" className="px-6 pb-32">
          <div ref={reveal} className="relative rounded-3xl px-12 py-20 text-center mx-auto overflow-hidden" style={{ maxWidth: 760, background: 'linear-gradient(135deg,rgba(107,92,231,0.12),rgba(107,92,231,0.04))', border: '1px solid rgba(107,92,231,0.25)' }}>
            <div className="absolute pointer-events-none" style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,92,231,0.2) 0%,transparent 70%)', top: -100, right: -50 }} />
            <h2 className="font-serif mb-5" style={{ fontSize: 'clamp(36px,4vw,52px)', letterSpacing: -1.5, lineHeight: 1.1 }}>
              Ready to stop paying<br />humans for <em style={{ fontStyle: 'italic', color: '#c4baff' }}>robot work?</em>
            </h2>
            <p className="text-lg mb-10 mx-auto leading-relaxed" style={{ color: 'var(--t2)', maxWidth: 500 }}>
              Book a free 30-minute call. We'll show you exactly what an agent would look like for your business.
            </p>
            <div className="flex justify-center gap-4 flex-wrap mb-5">
              <Btn href="/waitlist" primary>Join the waitlist →</Btn>
              <Btn href="/demo">See the demo first</Btn>
            </div>
            <div className="text-xs" style={{ color: 'var(--t3)' }}>No commitment · Free demo included · Live in under a week</div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between px-10 py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 font-bold text-sm">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)' }}>🤖</div>
          NexAgent
        </div>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Twitter', 'LinkedIn'].map(l => (
            <a key={l} href="#" className="text-xs no-underline transition-colors" style={{ color: 'var(--t3)' }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--t2)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--t3)')}>
              {l}
            </a>
          ))}
        </div>
        <div className="text-xs" style={{ color: 'var(--t3)' }}>© 2025 NexAgent</div>
      </footer>

      <style suppressHydrationWarning>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        em { font-family: 'Instrument Serif', serif; }
      `}</style>
    </>
  )
}
