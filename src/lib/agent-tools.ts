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

// Execute a tool call via n8n
export async function executeTool(
  tool: AgentTool,
  parameters: Record<string, any>,
  agentContext: { clientId: string; agentId: string; businessName: string }
): Promise<{ success: boolean; result: string; data?: any }> {
  const n8nBase = process.env.N8N_WEBHOOK_BASE_URL
  if (!n8nBase) {
    return { 
      success: false, 
      result: 'Automation system not configured' 
    }
  }

  try {
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
      }
    )

    if (!response.ok) {
      return { 
        success: false, 
        result: `Tool execution failed: ${response.status}` 
      }
    }

    const data = await response.json()
    return { success: true, result: data.message || 'Done', data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[Tool:${tool.name}] Error:`, message)
    return { success: false, result: 'Tool temporarily unavailable' }
  }
}
