// ─────────────────────────────────────────
// NexAgent → n8n webhook dispatcher
// All events fire-and-forget (non-blocking)
// ─────────────────────────────────────────

const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL

export type WebhookEvent =
  | 'lead.captured'
  | 'waitlist.signup'
  | 'payment.completed'
  | 'weekly.report'
  | 'agent.generated'
  | 'agent.approved'

export interface LeadPayload {
  event: 'lead.captured'
  storeId: string
  storeName: string
  fieldType: 'email' | 'phone'
  value: string
  timestamp: string
}

export interface WaitlistPayload {
  event: 'waitlist.signup'
  email: string
  businessName: string
  businessType: string
  message: string
  position: number
  timestamp: string
}

export interface PaymentPayload {
  event: 'payment.completed'
  clientEmail: string
  plan: string
  amount: number
  stripeSessionId: string
  timestamp: string
}

export interface AgentGeneratedPayload {
  event: 'agent.generated'
  clientId: string
  businessName: string
  agentName: string
  agentId: string
  businessType: string
  reviewUrl: string
  timestamp: string
}

export interface AgentApprovedPayload {
  event: 'agent.approved'
  clientEmail: string
  clientName: string
  agentName: string
  agentId: string
  widgetUrl: string
  dashboardUrl: string
  timestamp: string
}

export type WebhookPayload = 
  | LeadPayload 
  | WaitlistPayload 
  | PaymentPayload
  | AgentGeneratedPayload
  | AgentApprovedPayload

// Fire webhook to n8n — never blocks the main request
export async function fireWebhook(
  webhookPath: string,
  payload: WebhookPayload
): Promise<void> {
  if (!N8N_BASE_URL) {
    console.warn('[Webhook] N8N_WEBHOOK_BASE_URL not set, skipping')
    return
  }

  const url = `${N8N_BASE_URL}/${webhookPath}` 

  // Non-blocking — don't await this in calling code
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(err => {
    // Silent fail — never crash the main app
    console.error(`[Webhook] Failed to fire ${webhookPath}:`, err.message)
  })
}
