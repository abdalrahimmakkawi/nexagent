import OpenAI from 'openai'
import { AgentTool, executeTool } from './agent-tools'
import { cleanAIResponse } from './ai-utils'

const aiClient = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || 
    process.env.DEEPSEEK_BASE_URL || 
    'https://api.deepseek.com',
  apiKey: process.env.NVIDIA_API_KEY || 
    process.env.DEEPSEEK_API_KEY || '',
})

const MODEL = process.env.NVIDIA_MODEL || 
  process.env.DEEPSEEK_MODEL || 
  'deepseek-chat'

export interface PlanStep {
  step: number
  action: 'respond' | 'tool_call' | 'ask_user'
  tool?: string
  parameters?: Record<string, any>
  reason: string
}

export interface AgentPlan {
  canAct: boolean
  steps: PlanStep[]
  missingInfo: string[]
  finalResponse: string
}

// Planning prompt — forces agent to think before acting
function buildPlanningPrompt(
  message: string,
  tools: AgentTool[],
  systemPrompt: string,
  conversationHistory: any[]
): string {
  const toolDescriptions = tools.map(t => 
    `- ${t.name}: ${t.description}
     Parameters: ${Object.entries(t.parameters)
       .map(([k, v]) => `${k} (${v.required ? 'required' : 'optional'}): ${v.description}`)
       .join(', ')}`
  ).join('\n')

  return `You are an action-oriented AI agent for a business.
${systemPrompt}

AVAILABLE TOOLS:
${toolDescriptions || 'No tools available — respond only with text'}

CONVERSATION HISTORY:
${conversationHistory.slice(-6).map(m => 
  `${m.role}: ${m.content}`).join('\n')}

CURRENT MESSAGE: ${message}

INSTRUCTIONS:
1. Analyze if you have ALL required information to take action
2. If you can act: create a step-by-step plan
3. If information is missing: ask for it naturally
4. NEVER take irreversible actions without confirmation
5. Always explain what you're doing to the customer

Respond ONLY with valid JSON:
{
  "canAct": true/false,
  "steps": [
    {
      "step": 1,
      "action": "tool_call",
      "tool": "tool_name",
      "parameters": { "key": "value" },
      "reason": "why this step"
    },
    {
      "step": 2,
      "action": "respond",
      "reason": "confirm action to customer"
    }
  ],
  "missingInfo": ["list of missing required info"],
  "finalResponse": "What to say to the customer"
}`
}

export async function runPlanningAgent(
  message: string,
  tools: AgentTool[],
  systemPrompt: string,
  conversationHistory: any[],
  agentContext: { clientId: string; agentId: string; businessName: string }
): Promise<{
  response: string
  actionsExecuted: string[]
  plan: AgentPlan | null
}> {
  const actionsExecuted: string[] = []
  
  // Step 1: Create the plan
  let plan: AgentPlan | null = null
  
  if (tools.length > 0) {
    try {
      const planResponse = await aiClient.chat.completions.create({
        model: MODEL,
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for planning
        messages: [{
          role: 'user',
          content: buildPlanningPrompt(
            message, tools, systemPrompt, conversationHistory
          )
        }]
      })

      const rawPlan = planResponse.choices[0]?.message?.content || '{}'
      const cleanPlan = cleanAIResponse(rawPlan)

      plan = JSON.parse(cleanPlan) as AgentPlan
    } catch (err) {
      console.error('[PlanningAgent] Plan parsing failed:', err)
      plan = null
    }
  }

  // Step 2: Execute the plan
  if (plan?.canAct && plan.steps.length > 0) {
    for (const step of plan.steps) {
      if (step.action === 'tool_call' && step.tool) {
        const tool = tools.find(t => t.name === step.tool)
        if (tool && step.parameters) {
          console.log(`[PlanningAgent] Executing tool: ${step.tool}`)
          const result = await executeTool(tool, step.parameters, agentContext)
          
          if (result.success) {
            actionsExecuted.push(`${step.tool}: ${result.result}`)
          } else {
            console.error(`[PlanningAgent] Tool failed: ${step.tool}`)
          }
        }
      }
    }
  }

  // Step 3: Generate final response
  let finalResponse = plan?.finalResponse || ''
  
  if (!finalResponse || finalResponse.length < 10) {
    // Generate response using AI if plan didn't provide one
    const responseResult = await aiClient.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-8),
        { role: 'user', content: message },
        ...(actionsExecuted.length > 0 ? [{
          role: 'system' as const,
          content: `Actions completed: ${actionsExecuted.join(', ')}. 
            Inform the customer naturally about what was done.`
        }] : [])
      ]
    })
    
    finalResponse = cleanAIResponse(
      responseResult.choices[0]?.message?.content || 
      "I'm here to help. How can I assist you?"
    )
  }

  return { response: finalResponse, actionsExecuted, plan }
}
