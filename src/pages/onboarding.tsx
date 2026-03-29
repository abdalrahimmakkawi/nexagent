import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  businessName: string
  businessUrl: string
  businessType: string
  industry: string
  productsServices: string
  priceRange: string
  topFaqs: string
  tone: string
  goals: string
  extraInfo: string
  selectedPlan: string
}

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessUrl: '',
    businessType: '',
    industry: '',
    productsServices: '',
    priceRange: '',
    topFaqs: '',
    tone: 'friendly',
    goals: '',
    extraInfo: '',
    selectedPlan: '',
  } as FormData)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })
  }, [router])

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = 'Required'
        if (!formData.businessType) newErrors.businessType = 'Required'
        if (!formData.industry.trim()) newErrors.industry = 'Required'
        break
      case 2:
        if (!formData.productsServices.trim()) newErrors.productsServices = 'Required'
        if (!formData.topFaqs.trim()) newErrors.topFaqs = 'Required'
        break
      case 3:
        if (!formData.tone) newErrors.tone = 'Required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 4) setStep((step + 1) as Step)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    if (!formData.selectedPlan) {
      setErrors({ submit: 'Please select a plan' })
      return
    }

    setSubmitting(true)
    
    try {
      // First set the plan
      const planResponse = await fetch('/api/onboarding/set-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user?.id,
          plan: formData.selectedPlan,
        }),
      })

      const planResult = await planResponse.json()
      
      if (!planResult.ok) {
        setErrors({ submit: planResult.error || 'Failed to set plan' })
        setSubmitting(false)
        return
      }

      // Then submit the onboarding
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user?.id,
          ...formData,
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setSuccess(true)
      } else {
        setErrors({ submit: result.error || 'Failed to submit' })
      }
    } catch (err) {
      setErrors({ submit: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (success) {
    return (
      <>
        <Head><title>Onboarding Complete — NexAgent</title></Head>
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0a12' }}>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Icon name="check" size={32} style={{ color: 'white' }} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Your agent is being reviewed!
            </h1>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              We'll email you at {user?.email} once it's live. Usually within 24 hours.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 rounded-lg font-semibold transition-all"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              Go to dashboard →
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Onboarding — NexAgent</title></Head>
      <div className="min-h-screen" style={{ background: '#0a0a12' }}>
        {/* Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              Set up your AI agent
            </h1>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Step {step} of 4
            </div>
          </div>
          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mt-4">
            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div 
                className="h-1 rounded-full transition-all"
                style={{ width: `${(step / 4) * 100}%`, background: '#6366f1' }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          {submitting ? (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
              <div className="space-y-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <p>Analyzing your business...</p>
                <p>Designing your agent personality...</p>
                <p>Generating responses...</p>
                <p>Finalizing configuration...</p>
              </div>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Business Basics
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Business name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        borderColor: errors.businessName ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                      placeholder="Your business name"
                    />
                    {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Business website URL
                    </label>
                    <input
                      type="url"
                      value={formData.businessUrl}
                      onChange={(e) => setFormData({ ...formData, businessUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Business type *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        borderColor: errors.businessType ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                    >
                      <option value="">Select type</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Legal Services">Legal Services</option>
                      <option value="Education">Education</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Retail Store">Retail Store</option>
                      <option value="Service Business">Service Business</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.businessType && <p className="text-red-400 text-sm mt-1">{errors.businessType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        borderColor: errors.industry ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                      placeholder="e.g. Fashion, Electronics, Food"
                    />
                    {errors.industry && <p className="text-red-400 text-sm mt-1">{errors.industry}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Your Products & Services
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Products/Services description *
                    </label>
                    <textarea
                      value={formData.productsServices}
                      onChange={(e) => setFormData({ ...formData, productsServices: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        borderColor: errors.productsServices ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        minHeight: '140px'
                      }}
                      placeholder="Describe what you sell or offer. Include product names, prices, key details. The more detail, the better your agent will be."
                    />
                    {errors.productsServices && <p className="text-red-400 text-sm mt-1">{errors.productsServices}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Price range
                    </label>
                    <input
                      type="text"
                      value={formData.priceRange}
                      onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      placeholder="e.g. $20-$500, starts from $99/month"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Top customer FAQs *
                    </label>
                    <textarea
                      value={formData.topFaqs}
                      onChange={(e) => setFormData({ ...formData, topFaqs: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        borderColor: errors.topFaqs ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        minHeight: '140px'
                      }}
                      placeholder="What are the most common questions your customers ask? List them one per line."
                    />
                    {errors.topFaqs && <p className="text-red-400 text-sm mt-1">{errors.topFaqs}</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Choose Your Agent Team
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Support Plan */}
                    <div 
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        formData.selectedPlan === 'starter' 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-600 bg-gray-800'
                      }`}
                      onClick={() => setFormData({ ...formData, selectedPlan: 'starter' })}
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">🛡️</div>
                        <h3 className="text-xl font-bold mb-2">Support</h3>
                        <div className="text-2xl font-bold mb-3">$199<span className="text-sm font-normal">/month</span></div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><span className="mr-2">✅</span> 1 AI support agent</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Unlimited conversations</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Lead capture (email & SMS)</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Conversation history</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Weekly analytics</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Setup in 3 days</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Cancel anytime</li>
                      </ul>
                      <div className="text-sm text-gray-400 mt-4">
                        Best for: Small businesses just starting out
                      </div>
                      <button
                        className="w-full py-3 rounded-lg font-semibold transition-all"
                        style={{
                          background: formData.selectedPlan === 'starter' ? '#fff' : 'transparent',
                          color: formData.selectedPlan === 'starter' ? '#000' : '#fff',
                          border: '1px solid #fff'
                        }}
                        onClick={() => setFormData({ ...formData, selectedPlan: 'starter' })}
                      >
                        Choose Support
                      </button>
                    </div>

                    {/* Operations Plan - RECOMMENDED */}
                    <div 
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer relative ${
                        formData.selectedPlan === 'team' 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-600 bg-gray-800'
                      }`}
                      onClick={() => setFormData({ ...formData, selectedPlan: 'team' })}
                    >
                      {formData.selectedPlan !== 'team' && (
                        <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          RECOMMENDED
                        </div>
                      )}
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">🔀 🛡️ 💰 ⚡ 🚨</div>
                        <h3 className="text-xl font-bold mb-2">Operations</h3>
                        <div className="text-2xl font-bold mb-3">$599<span className="text-sm font-normal">/month</span></div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><span className="mr-2">✅</span> Everything in Support</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> 5 specialized AI agents</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Smart routing between agents</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Appointment booking</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> CRM updates</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Email follow-ups</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Lead qualification</li>
                      </ul>
                      <div className="text-sm text-gray-400 mt-4">
                        Best for: Growing businesses
                      </div>
                      <button
                        className="w-full py-3 rounded-lg font-semibold transition-all"
                        style={{
                          background: formData.selectedPlan === 'team' ? '#fff' : 'transparent',
                          color: formData.selectedPlan === 'team' ? '#000' : '#fff',
                          border: '1px solid #fff'
                        }}
                        onClick={() => setFormData({ ...formData, selectedPlan: 'team' })}
                      >
                        Choose Operations
                      </button>
                    </div>

                    {/* Business Plan */}
                    <div 
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        formData.selectedPlan === 'squad' 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-600 bg-gray-800'
                      }`}
                      onClick={() => setFormData({ ...formData, selectedPlan: 'squad' })}
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">🔀 🛡️ 💰 ⚡ 🚨 🔄 📊 👋</div>
                        <h3 className="text-xl font-bold mb-2">Business</h3>
                        <div className="text-2xl font-bold mb-3">$1,199<span className="text-sm font-normal">/month</span></div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><span className="mr-2">✅</span> Everything in Operations</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> All 8 AI agents</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> WhatsApp + email + website</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Revenue operations</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Custom workflows</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> Dedicated account manager</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> SLA guarantee</li>
                        <li className="flex items-center"><span className="mr-2">✅</span> White-label option</li>
                      </ul>
                      <div className="text-sm text-gray-400 mt-4">
                        Best for: Established businesses
                      </div>
                      <button
                        className="w-full py-3 rounded-lg font-semibold transition-all"
                        style={{
                          background: formData.selectedPlan === 'squad' ? '#fff' : 'transparent',
                          color: formData.selectedPlan === 'squad' ? '#000' : '#fff',
                          border: '1px solid #fff'
                        }}
                        onClick={() => setFormData({ ...formData, selectedPlan: 'squad' })}
                      >
                        Choose Business
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                    Review & Submit
                  </h2>
                  
                  <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: '#fff' }}>Business Information</h3>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      <p><strong>Name:</strong> {formData.businessName}</p>
                      <p><strong>Website:</strong> {formData.businessUrl || 'Not provided'}</p>
                      <p><strong>Type:</strong> {formData.businessType}</p>
                      <p><strong>Industry:</strong> {formData.industry}</p>
                      <p><strong>Products/Services:</strong> {formData.productsServices}</p>
                      <p><strong>Price Range:</strong> {formData.priceRange || 'Not provided'}</p>
                      <p><strong>Tone:</strong> {formData.tone}</p>
                    </div>
                  </div>

                  <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: '#fff' }}>Top FAQs</h3>
                    <div className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {formData.topFaqs}
                    </div>
                  </div>

                  <div className="text-center py-6">
                    <p className="mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Our AI will generate your custom agent in seconds. You'll be notified once it's ready for review — usually within 24 hours.
                    </p>
                    {errors.submit && <p className="text-red-400 mb-4">{errors.submit}</p>}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className="px-6 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: step === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    color: step === 1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  ← Back
                </button>
                
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 rounded-lg font-semibold transition-all"
                    style={{ background: '#6366f1', color: '#fff' }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 rounded-lg font-semibold transition-all"
                    style={{ background: '#6366f1', color: '#fff' }}
                  >
                    Generate My Agent →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
