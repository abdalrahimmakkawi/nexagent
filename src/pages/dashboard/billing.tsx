import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'

interface PaymentHistory {
  id: string
  date: string
  amount: number
  plan: string
  status: 'completed' | 'pending' | 'failed'
}

interface Plan {
  name: string
  price: number
  features: string[]
  highlighted?: boolean
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>('Starter')
  const [billingDate, setBillingDate] = useState<string>('')
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)

  const plans: Plan[] = [
    {
      name: 'Starter',
      price: 29,
      features: [
        'Up to 500 conversations/month',
        'Basic AI agent',
        'Email support',
        'Standard analytics',
        '1 active agent'
      ]
    },
    {
      name: 'Professional',
      price: 79,
      features: [
        'Up to 2,000 conversations/month',
        'Advanced AI agent',
        'Priority support',
        'Advanced analytics',
        '3 active agents',
        'Custom branding',
        'Lead capture'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 199,
      features: [
        'Unlimited conversations',
        'Custom AI agents',
        '24/7 phone support',
        'White-label solution',
        'Unlimited agents',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee'
      ]
    }
  ]

  const mockPaymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: '2024-03-15',
      amount: 79,
      plan: 'Professional',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-02-15',
      amount: 79,
      plan: 'Professional',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-01-15',
      amount: 29,
      plan: 'Starter',
      status: 'completed'
    }
  ]

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      // Mock data for now - will connect to Stripe API later
      setCurrentPlan('Professional')
      setBillingDate('March 15, 2024')
      setPaymentHistory(mockPaymentHistory)
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (planName: string) => {
    // Placeholder for Stripe checkout
    const email = 'abdalrahimmakkawi@gmail.com'
    const subject = 'Plan Upgrade Request'
    const body = `I would like to upgrade to the ${planName} plan.`
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="billing">
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Billing - NexAgent Dashboard</title>
      </Head>

      <DashboardLayout activeTab="billing">
        <div className="p-8">
          {/* Current Plan Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Plan</div>
                <div className="text-2xl font-bold text-white">{currentPlan}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Monthly Price</div>
                <div className="text-2xl font-bold text-white">
                  ${plans.find(p => p.name === currentPlan)?.price || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Next Billing Date</div>
                <div className="text-2xl font-bold text-white">{billingDate}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">Your Features</h3>
              <ul className="space-y-2">
                {plans.find(p => p.name === currentPlan)?.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Icon name="check" size={16} style={{ color: '#22c55e', marginRight: '8px' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Plan Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-gray-800 rounded-lg border p-6 ${
                    plan.highlighted ? 'border-blue-500' : 'border-gray-700'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="text-center mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white">
                      ${plan.price}
                      <span className="text-lg text-gray-400">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <Icon name="check" size={16} style={{ color: '#22c55e', marginRight: '8px', marginTop: '2px' }} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.name === currentPlan}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      plan.name === currentPlan
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {plan.name === currentPlan ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Want to upgrade? <a href="mailto:abdalrahimmakkawi@gmail.com" className="text-blue-400 hover:text-blue-300">Contact us</a> for custom plans
              </p>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Payment History</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-700">
                      <td className="p-4 text-gray-300">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-white font-medium">
                        ${payment.amount}
                      </td>
                      <td className="p-4 text-gray-300">
                        {payment.plan}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cancel Subscription */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Need to cancel?</h3>
            <p className="text-gray-400 mb-4">
              We're sorry to see you go. No lock-in — cancel anytime.
            </p>
            <a
              href="mailto:abdalrahimmakkawi@gmail.com?subject=Subscription Cancellation Request"
              className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Contact us
            </a>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
