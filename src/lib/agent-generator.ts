import { aiClient, aiModel } from './nvidia-client'

export interface OnboardingData {
  businessName: string
  businessUrl?: string
  businessType: string
  industry: string
  productsServices: string
  priceRange?: string
  topFaqs: string
  tone: string
  competitors?: string
  goals?: string
  extraInfo?: string
}

export interface GeneratedAgentConfig {
  agentName: string
  systemPrompt: string
  welcomeMessage: string
  quickPrompts: string[]
  leadField: 'email' | 'phone'
  leadMessage: string
  escalationTriggers: string[]
  widgetColor: string
  suggestedName: string
}

export async function generateAgentConfig(
  data: OnboardingData
): Promise<GeneratedAgentConfig> {
  const prompt = `You are an expert AI agent designer. 
A business has submitted their information and you must 
generate a complete, production-ready AI support agent 
configuration for them.

BUSINESS INFORMATION:
- Name: ${data.businessName}
- Website: ${data.businessUrl || 'Not provided'}
- Type: ${data.businessType}
- Industry: ${data.industry}
- Products/Services: ${data.productsServices}
- Price Range: ${data.priceRange || 'Not provided'}
- Top FAQs from customers: ${data.topFaqs}
- Desired tone: ${data.tone}
- Goals: ${data.goals || 'Handle customer support efficiently'}
- Extra info: ${data.extraInfo || 'None'}

Generate a complete agent configuration. Respond ONLY 
with a valid JSON object, no markdown, no explanation.
The JSON must have exactly these fields:

{
  "agentName": "A short friendly name for the agent (e.g. Aria, Max, Luna)",
  "systemPrompt": "A comprehensive system prompt (200-350 words) that tells the AI exactly how to behave for this specific business. Include: role, business details, products, prices, policies, tone guidelines, what to do when frustrated customers contact, when to capture leads, when to escalate. Be specific and detailed.",
  "welcomeMessage": "A warm opening message from the agent (1-2 sentences, matches the business tone)",
  "quickPrompts": ["5 most common questions customers ask this specific business", "each as a short question string", "relevant to their industry", "natural sounding", "max 6 words each"],
  "leadField": "email or phone depending on which is more appropriate for this business type",
  "leadMessage": "A natural, non-pushy message asking for their contact info (1 sentence)",
  "escalationTriggers": ["6-8 words or phrases that indicate a frustrated or complex customer that needs human help", "specific to this business", "e.g. refund, broken, manager"],
  "widgetColor": "A hex color that matches or complements this business type (avoid generic purple, pick something fitting)",
  "suggestedName": "The agent name again"
}`

  const response = await aiClient.chat.completions.create({
    model: aiModel,
    max_tokens: 2000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  })
  
  const content = response.choices[0].message.content || ''
  // Strip markdown fences if present
  const clean = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const config = JSON.parse(clean) as GeneratedAgentConfig
    return config
  } catch {
    throw new Error(`Failed to parse agent config: ${clean}`)
  }
}
