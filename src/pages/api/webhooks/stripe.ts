import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { fireWebhook } from '@/lib/webhooks'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: any) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).json({ error: 'Invalid signature' })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const customerEmail = session.customer_details?.email

        if (customerId && customerEmail) {
          // Update client plan to active and store Stripe customer ID
          const { error } = await (supabaseAdmin
            .from('clients') as any)
            .update({ 
              plan: 'active',
              stripe_customer_id: customerId,
              status: 'active'
            })
            .eq('email', customerEmail)

          if (error) {
            console.error('Error updating client plan:', error)
            return res.status(500).json({ error: 'Database update failed' })
          }

          // Fire n8n webhook — non-blocking
          fireWebhook('webhook/payment-completed', {
            event: 'payment.completed',
            clientEmail: session.customer_email || customerEmail || '',
            plan: session.metadata?.plan || 'growth',
            amount: session.amount_total ? session.amount_total / 100 : 0,
            stripeSessionId: session.id,
            timestamp: new Date().toISOString(),
          })

          console.log(`Activated plan for customer: ${customerEmail}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Update client plan to cancelled
        const { error } = await (supabaseAdmin
          .from('clients') as any)
          .update({ 
            plan: 'cancelled',
            status: 'cancelled'
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error updating client plan on cancellation:', error)
          return res.status(500).json({ error: 'Database update failed' })
        }

        console.log(`Cancelled plan for customer: ${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}
