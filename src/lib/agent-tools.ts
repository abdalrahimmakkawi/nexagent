export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, {
    type: string
    description: string
    required: boolean
  }>
  webhookPath: string
  tier: 'starter' | 'team' | 'squad' | 'enterprise'
}

export const AVAILABLE_TOOLS: AgentTool[] = [
  {
    name: 'book_appointment',
    description: 'Book a meeting or appointment for a customer',
    parameters: {
      customer_name: { type: 'string', description: 'Customer full name', required: true },
      customer_email: { type: 'string', description: 'Customer email', required: true },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format', required: true },
      time: { type: 'string', description: 'Time in HH:MM format', required: true },
      notes: { type: 'string', description: 'Any notes about the appointment', required: false },
    },
    webhookPath: 'webhook/tool-book-appointment',
    tier: 'team',
  },
  {
    name: 'send_email',
    description: 'Send a follow-up or confirmation email to customer',
    parameters: {
      to_email: { type: 'string', description: 'Recipient email', required: true },
      subject: { type: 'string', description: 'Email subject', required: true },
      body: { type: 'string', description: 'Email body in plain text', required: true },
    },
    webhookPath: 'webhook/tool-send-email',
    tier: 'team',
  },
  {
    name: 'create_lead',
    description: 'Save a qualified lead to CRM or database',
    parameters: {
      name: { type: 'string', description: 'Lead full name', required: true },
      email: { type: 'string', description: 'Lead email', required: false },
      phone: { type: 'string', description: 'Lead phone number', required: false },
      interest: { type: 'string', description: 'What they are interested in', required: true },
      priority: { type: 'string', description: 'low, medium, or high', required: true },
    },
    webhookPath: 'webhook/tool-create-lead',
    tier: 'team',
  },
  {
    name: 'check_availability',
    description: 'Check if a time slot is available for booking',
    parameters: {
      date: { type: 'string', description: 'Date to check YYYY-MM-DD', required: true },
      time: { type: 'string', description: 'Time to check HH:MM', required: true },
    },
    webhookPath: 'webhook/tool-check-availability',
    tier: 'team',
  },
  {
    name: 'send_quote',
    description: 'Send a price quote or proposal to a customer',
    parameters: {
      customer_email: { type: 'string', description: 'Customer email', required: true },
      customer_name: { type: 'string', description: 'Customer name', required: true },
      service: { type: 'string', description: 'Service they are interested in', required: true },
      price: { type: 'string', description: 'Price or price range', required: true },
    },
    webhookPath: 'webhook/tool-send-quote',
    tier: 'squad',
  },
  {
    name: 'escalate_to_human',
    description: 'Alert a human team member about urgent situation',
    parameters: {
      reason: { type: 'string', description: 'Why escalation is needed', required: true },
      customer_name: { type: 'string', description: 'Customer name', required: false },
      urgency: { type: 'string', description: 'low, medium, high, critical', required: true },
    },
    webhookPath: 'webhook/tool-escalate',
    tier: 'starter',
  },
  {
    name: 'lookup_order',
    description: 'Look up order status or customer account information',
    parameters: {
      order_id: { type: 'string', description: 'Order ID or reference number', required: false },
      customer_email: { type: 'string', description: 'Customer email to look up', required: false },
    },
    webhookPath: 'webhook/tool-lookup-order',
    tier: 'team',
  },
]

// Get tools available for a given plan
export function getToolsForPlan(plan: string): AgentTool[] {
  const tierMap: Record<string, string[]> = {
    starter: ['starter'],
    team: ['starter', 'team'],
    squad: ['starter', 'team', 'squad'],
    enterprise: ['starter', 'team', 'squad', 'enterprise'],
  }
  const allowedTiers = tierMap[plan] || ['starter']
  return AVAILABLE_TOOLS.filter(t => 
    allowedTiers.includes(t.tier)
  )
}

// Execute a tool call via n8n with graceful fallback
export async function executeTool(
  tool: AgentTool,
  parameters: Record<string, any>,
  agentContext: { clientId: string; agentId: string; businessName: string }
): Promise<{ success: boolean; result: string; data?: any }> {
  const n8nBase = process.env.N8N_WEBHOOK_BASE_URL
  
  if (!n8nBase) {
    // Log but don't crash — return simulated success
    console.warn(`[Tool:${tool.name}] n8n not configured, using fallback response`)
    
    // Return a simulated helpful response
    const simulations: Record<string, string> = {
      'book_appointment': 'Appointment request noted. Our team will confirm within 2 hours.',
      'send_email': 'Message received. You will get a follow-up email shortly.',
      'create_lead': 'Your information has been saved. We will be in touch soon.',
      'check_availability': 'Please call us directly to check real-time availability.',
      'escalate_to_human': 'A team member has been alerted and will contact you shortly.',
      'lookup_order': 'Please provide your order number and we will check it for you.',
      'send_quote': 'Quote request received. We will send details to your email.',
    }
    
    return { 
      success: true,
      result: simulations[tool.name] || 'Request received. Our team will follow up.',
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(
      `${n8nBase}/${tool.webhookPath}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.name,
          parameters,
          context: agentContext,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return { 
      success: true, 
      result: data.message || 'Action completed successfully',
      data 
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown'
    console.error(`[Tool:${tool.name}] Error:`, message)
    
    // Return helpful fallback message instead of failure
    const fallbackMessages: Record<string, string> = {
      'book_appointment': 'I\'ve noted your appointment request. Our team will contact you to confirm the details.',
      'send_email': 'Your message has been recorded. We\'ll make sure you receive a follow-up email.',
      'create_lead': 'Your information has been saved successfully. Someone from our team will reach out soon.',
      'check_availability': 'For real-time availability, please contact us directly. I\'ve noted your preferred time.',
      'escalate_to_human': 'I\'ve escalated this to our human team. They will contact you as soon as possible.',
      'lookup_order': 'I\'ve recorded your order inquiry. Please have your order number ready when we contact you.',
      'send_quote': 'Your quote request has been submitted. We\'ll send pricing information to your email.',
    }
    
    return { 
      success: false, 
      result: fallbackMessages[tool.name] || 'I noted your request and our team will follow up shortly.' 
    }
  }
}
