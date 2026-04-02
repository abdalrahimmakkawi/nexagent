import { aiClient, aiModel, processAIResponse } from './nvidia-client'
import { supabaseAdmin } from './supabase'
import { cleanAIResponse } from './ai-utils'

// ── TYPES ────────────────────────────────────────
export type AgentType = 
  | 'router' | 'support' | 'sales' 
  | 'faq' | 'escalation' | 'followup' 
  | 'analytics' | 'onboarding'

export interface RouterDecision {
  assignTo: AgentType
  sentiment: number
  intent: 'complaint' | 'inquiry' | 'purchase' | 
    'frustrated' | 'greeting' | 'legal'
  urgency: 'low' | 'medium' | 'high'
  summary: string
  shouldCaptureLead: boolean
  shouldEscalate: boolean
}

export interface AgentContext {
  businessName: string
  industry: string
  systemPrompt: string
  activeAgents: AgentType[]
  conversationHistory: { role: string; content: string }[]
  routingDecision?: RouterDecision
}

// ── ROUTER AGENT ─────────────────────────────────
// Reads every message and decides who handles it
async function runRouterAgent(
  message: string,
  context: AgentContext,
  conversationId?: string
): Promise<RouterDecision> {
  const routerPrompt = `You are Router Agent for ${context.businessName}.
Your ONLY job is to analyze the customer message and output a routing decision.
You NEVER respond to the customer directly.
Available agents: ${context.activeAgents.join(', ')}

Output ONLY valid JSON with this exact structure:
{
  "assignTo": "support" | "sales" | "faq" | "escalation" | "onboarding",
  "sentiment": 0.0 to 1.0 (0=very negative, 1=very positive),
  "intent": "complaint" | "inquiry" | "purchase" | "frustrated" | "greeting" | "legal",
  "urgency": "low" | "medium" | "high",
  "summary": "one sentence of what the customer needs",
  "shouldCaptureLead": true | false,
  "shouldEscalate": true | false
}

Routing rules:
- First message / greeting → onboarding (if available) else faq
- complaint / return / order issue / frustrated → support
- pricing / product question / buying intent → sales
- simple factual question → faq
- very angry / threatening / legal / refund demand → escalation
- shouldCaptureLead: true when customer shows buying intent
- shouldEscalate: true when sentiment < 0.2 or intent is legal`

  const response = await aiClient.chat.completions.create({
    model: aiModel,
    max_tokens: 200,
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: routerPrompt
      },
      {
        role: 'user', 
        content: `Customer message: "${message}"`
      }
    ]
  })

  const raw = response.choices[0]?.message?.content || '{}'
  const clean = cleanAIResponse(raw)
  
  try {
    const decision = JSON.parse(clean) as RouterDecision
    
    // Save routing decision to database
    if (conversationId) {
      await supabaseAdmin.from('routing_decisions').insert({
        conversation_id: conversationId,
        message_content: message.slice(0, 200),
        assigned_to: decision.assignTo,
        sentiment: decision.sentiment,
        intent: decision.intent,
        urgency: decision.urgency,
      } as any)
    }
    
    return decision
  } catch {
    // Default routing if JSON parse fails
    return {
      assignTo: 'support',
      sentiment: 0.5,
      intent: 'inquiry',
      urgency: 'medium',
      summary: message.slice(0, 100),
      shouldCaptureLead: false,
      shouldEscalate: false,
    }
  }
}

// ── SPECIALIST AGENT PROMPTS ──────────────────────
function getSpecialistPrompt(
  agentType: AgentType,
  context: AgentContext,
  decision: RouterDecision
): string {
  const base = `You are a specialist AI agent for ${context.businessName}.
Business context: ${context.systemPrompt}
Customer sentiment: ${decision.sentiment} (0=very negative, 1=very positive)
Customer intent: ${decision.intent}
Urgency: ${decision.urgency}
Summary of need: ${decision.summary}
Keep responses under 100 words unless detail is needed.
Use **bold** for key information.`

  const specializations: Record<AgentType, string> = {
    router: base,
    
    support: `${base}

You are a SUPPORT SPECIALIST. Your job:
- Handle complaints, returns, order issues with empathy
- Always acknowledge the customer's frustration first
- Provide clear, actionable solutions
- Offer compensation or alternatives when appropriate
- Never be defensive about the business
- If you cannot resolve: offer to connect with a human`,

    sales: `${base}

You are a SALES SPECIALIST. Your job:
- Capture leads naturally (ask for email/phone)
- Recommend relevant products or services
- Highlight value and benefits not features
- Create gentle urgency without being pushy
- Answer pricing questions with confidence
- Always end with a clear next step`,

    faq: `${base}

You are a FAQ SPECIALIST. Your job:
- Answer common questions instantly and accurately
- Be concise — one clear answer, no fluff
- If the answer isn't in your knowledge: say so honestly
- Never guess or make up information
- Suggest related questions the customer might have`,

    escalation: `${base}

You are an ESCALATION SPECIALIST. Your job:
- De-escalate angry or upset customers immediately
- Start with a sincere, direct apology
- Never argue or be defensive
- Acknowledge their frustration as valid
- Offer concrete resolution options
- Always offer human support as an option
- Use calm, professional language only`,

    onboarding: `${base}

You are an ONBOARDING SPECIALIST. Your job:
- Welcome new customers warmly
- Explain what you can help with
- Ask what brings them here today
- Guide them to the right information
- Make them feel welcome and valued
- Capture their contact info naturally`,

    followup: `${base}

You are a FOLLOW-UP SPECIALIST. Your job:
- Re-engage customers who showed interest
- Reference their previous conversation naturally
- Offer to help complete what they started
- Provide additional value or information
- Never be pushy — be helpful`,

    analytics: `${base}

You are an ANALYTICS SPECIALIST. Your job:
- Summarize conversation patterns and insights
- Identify common customer pain points
- Highlight successful resolution patterns
- Suggest improvements to the agent system
- Provide actionable business recommendations`,
  }

  return specializations[agentType] || base
}

// ── MAIN MULTI-AGENT CHAT FUNCTION ───────────────
export async function multiAgentChat(
  message: string,
  context: AgentContext,
  conversationId?: string
): Promise<{
  content: string
  agentUsed: AgentType
  decision: RouterDecision
  latencyMs: number
}> {
  const start = Date.now()

  // Step 1: Router decides who handles this
  const decision = await runRouterAgent(
    message, 
    context,
    conversationId
  )

  // Step 2: Check if assigned agent is available
  let assignedAgent = decision.assignTo
  if (!context.activeAgents.includes(assignedAgent)) {
    // Fallback to support if assigned agent not available
    assignedAgent = context.activeAgents.includes('support') 
      ? 'support' 
      : context.activeAgents[0]
  }

  // Step 3: Run the specialist agent
  const specialistPrompt = getSpecialistPrompt(
    assignedAgent, 
    context, 
    decision
  )

  const response = await aiClient.chat.completions.create({
    model: aiModel,
    max_tokens: 512,
    temperature: 0.7,
    messages: [
      { role: 'system', content: specialistPrompt },
      ...context.conversationHistory.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ],
  })

  const rawContent = response.choices[0]?.message?.content || "I'm here to help. Could you tell me more?"
  const content = cleanAIResponse(rawContent)

  return {
    content,
    agentUsed: assignedAgent,
    decision,
    latencyMs: Date.now() - start,
  }
}

// ── PLAN CONFIGURATIONS ───────────────────────────
export const PLAN_AGENTS: Record<string, AgentType[]> = {
  starter: ['support'],
  team: ['router', 'support', 'sales', 'faq', 'escalation'],
  squad: ['router', 'support', 'sales', 'faq', 
    'escalation', 'followup', 'analytics', 'onboarding'],
  enterprise: ['router', 'support', 'sales', 'faq',
    'escalation', 'followup', 'analytics', 'onboarding'],
}
