import OpenAI from 'openai'

interface SmartOnboardingData {
  businessName: string
  businessType: string
  industry: string
  targetAudience: string
  mainGoals: string[]
  currentChallenges: string[]
  preferredTone: string
  features: string[]
}

interface GeneratedAgent {
  name: string
  systemPrompt: string
  welcomeMessage: string
  quickPrompts: string[]
  leadMessage: string
  escalationTriggers: string[]
  widgetColor: string
  capabilities: string[]
}

export async function generateSmartAgentConfig(onboardingData: SmartOnboardingData): Promise<GeneratedAgent> {
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
  })

  // Create industry-specific prompts
  const industryPrompts: Record<string, string> = {
    'Technology & Software': 'You are an AI customer support agent for a technology/SaaS company. You help with technical troubleshooting, bug reports, feature requests, and user onboarding. Use technical terminology but explain complex concepts simply.',
    'Retail & E-commerce': 'You are an AI customer support agent for an e-commerce business. You help with order tracking, returns, product recommendations, shipping inquiries, and customer service. Be friendly, helpful, and focused on sales and customer satisfaction.',
    'Healthcare & Medical': 'You are an AI assistant for a healthcare provider. You help with appointment scheduling, basic medical inquiries, insurance questions, and patient support. Be professional, empathetic, and prioritize patient privacy and care.',
    'Finance & Insurance': 'You are an AI support agent for a financial services company. You help with account inquiries, transaction support, basic financial questions, and customer service. Be professional, secure, and compliant with financial regulations.',
    'Education & Training': 'You are an AI educational assistant. You help with course information, enrollment, technical support, and student guidance. Be encouraging, supportive, and focused on learning outcomes.',
    'Professional Services': 'You are an AI assistant for a professional services firm. You help with client inquiries, appointment scheduling, service information, and project coordination. Be professional, organized, and client-focused.',
    'Manufacturing & Industrial': 'You are an AI support agent for a manufacturing company. You help with product inquiries, technical specifications, order support, and supply chain questions. Be technical, precise, and solution-oriented.',
    'Hospitality & Tourism': 'You are an AI hospitality assistant. You help with reservations, customer inquiries, service information, and travel support. Be welcoming, helpful, and focused on customer experience.',
    'Media & Entertainment': 'You are an AI assistant for a media/entertainment company. You help with content inquiries, customer support, and technical assistance. Be engaging, creative, and brand-aligned.',
    'Government & Non-profit': 'You are an AI assistant for a government or non-profit organization. You help with public inquiries, service information, and administrative support. Be professional, respectful, and service-oriented.'
  }

  // Create tone-specific guidelines
  const toneGuidelines: Record<string, string> = {
    'Professional and formal': 'Use formal language, proper grammar, and a respectful tone. Avoid slang and overly casual expressions.',
    'Friendly and casual': 'Use conversational language, contractions where appropriate, and a warm, approachable tone. Be friendly but maintain professionalism.',
    'Technical and precise': 'Use accurate technical terminology, be specific and detailed, and focus on precision and clarity.',
    'Empathetic and supportive': 'Use understanding language, acknowledge customer concerns, and provide reassurance. Focus on emotional intelligence.',
    'Enthusiastic and energetic': 'Use positive, energetic language, and an upbeat tone. Show excitement about helping customers.',
    'Concise and direct': 'Use short, clear sentences. Get straight to the point. Avoid unnecessary words and be efficient.'
  }

  // Generate agent name based on business
  const generateAgentName = (): string => {
    const businessName = onboardingData.businessName.trim()
    const businessType = onboardingData.businessType.toLowerCase()
    
    if (businessName.toLowerCase().includes('ai') || businessName.toLowerCase().includes('bot')) {
      return businessName
    }
    
    const nameSuggestions = {
      'ecommerce': `${businessName} Assistant`,
      'saas': `${businessName} Support`,
      'professional': `${businessName} Agent`,
      'healthcare': `${businessName} Care`,
      'finance': `${businessName} Advisor`,
      'education': `${businessName} Guide`,
      'hospitality': `${businessName} Concierge`,
      'default': `${businessName} AI`
    }

    for (const [key, suggestion] of Object.entries(nameSuggestions)) {
      if (businessType.includes(key)) {
        return suggestion
      }
    }
    
    return nameSuggestions.default
  }

  // Generate system prompt
  const generateSystemPrompt = (): string => {
    const industryPrompt = industryPrompts[onboardingData.industry] || industryPrompts['Professional Services']
    const toneGuideline = toneGuidelines[onboardingData.preferredTone] || toneGuidelines['Professional and formal']
    
    const goalsContext = onboardingData.mainGoals.length > 0 
      ? `The user's primary goals are: ${onboardingData.mainGoals.join(', ')}. `
      : ''
    
    const challengesContext = onboardingData.currentChallenges.length > 0
      ? `They currently face these challenges: ${onboardingData.currentChallenges.join(', ')}. `
      : ''
    
    const audienceContext = onboardingData.targetAudience
      ? `The target audience is: ${onboardingData.targetAudience}. `
      : ''

    return `${industryPrompt} ${toneGuideline} ${goalsContext}${challengesContext}${audienceContext}

Key Requirements:
1. Always be helpful, accurate, and professional
2. If you don't know something, admit it honestly
3. If you can't help with a request, suggest appropriate alternatives
4. Maintain the ${onboardingData.preferredTone.toLowerCase()} tone throughout the conversation
5. Focus on solving the user's problems efficiently
6. For ${onboardingData.businessName}, prioritize customer satisfaction and business goals

Business Context:
- Company: ${onboardingData.businessName}
- Type: ${onboardingData.businessType}
- Industry: ${onboardingData.industry}
- Target Audience: ${onboardingData.targetAudience}
- Main Goals: ${onboardingData.mainGoals.join(', ')}
- Current Challenges: ${onboardingData.currentChallenges.join(', ')}

Response Guidelines:
- Be concise but thorough
- Use appropriate industry terminology
- Show empathy when dealing with customer issues
- Proactively offer help and suggestions
- When appropriate, guide customers to additional resources
- Always maintain brand consistency with ${onboardingData.businessName}`
  }

  // Generate welcome message
  const generateWelcomeMessage = (): string => {
    const greetings = {
      'Professional and formal': `Welcome to ${onboardingData.businessName}. How may I assist you today?`,
      'Friendly and casual': `Hi there! Welcome to ${onboardingData.businessName}! I'm here to help. What can I do for you?`,
      'Technical and precise': `${onboardingData.businessName} Support. Please state your technical issue or inquiry.`,
      'Empathetic and supportive': `Welcome to ${onboardingData.businessName}. I'm here to help and support you. Please let me know how I can assist.`,
      'Enthusiastic and energetic': `Welcome to ${onboardingData.businessName}! So excited to help you today! What can I assist you with?`,
      'Concise and direct': `${onboardingData.businessName}. How may I help?`
    }

    return greetings[onboardingData.preferredTone] || greetings['Professional and formal']
  }

  // Generate quick prompts based on goals
  const generateQuickPrompts = (): string[] => {
    const basePrompts = ['Track my order', 'Check availability', 'Speak to a human', 'Product information']
    
    if (onboardingData.mainGoals.includes('24/7 customer support')) {
      basePrompts.push('I need urgent help', 'Check order status', 'Technical support')
    }
    
    if (onboardingData.mainGoals.includes('Lead generation and qualification')) {
      basePrompts.push('Get a quote', 'Schedule consultation', 'Product demo')
    }
    
    if (onboardingData.mainGoals.includes('Appointment booking')) {
      basePrompts.push('Book appointment', 'Check availability', 'Reschedule meeting')
    }
    
    if (onboardingData.mainGoals.includes('Product recommendations')) {
      basePrompts.push('Product suggestions', 'Find similar items', 'Compare products')
    }

    return basePrompts.slice(0, 6) // Limit to 6 prompts
  }

  // Generate lead capture message
  const generateLeadMessage = (): string => {
    if (onboardingData.mainGoals.includes('Lead generation and qualification')) {
      return `I'd be happy to help with that! Let me collect some information to connect you with the right team member at ${onboardingData.businessName}. What's the best way to reach you?`
    }
    
    return `Thank you for your interest in ${onboardingData.businessName}! I'll make sure you get the help you need. May I ask for your contact information so we can follow up?`
  }

  // Generate escalation triggers
  const generateEscalationTriggers = (): string[] => {
    const baseTriggers = ['human agent', 'speak to manager', 'complaint', 'urgent', 'emergency']
    
    if (onboardingData.currentChallenges.includes('High volume of repetitive questions')) {
      baseTriggers.push('complex issue', 'escalate needed')
    }
    
    if (onboardingData.currentChallenges.includes('Language barriers')) {
      baseTriggers.push('language preference', 'translation needed')
    }
    
    return baseTriggers
  }

  // Generate widget color based on business type
  const generateWidgetColor = (): string => {
    const colorMap: Record<string, string> = {
      'E-commerce / Retail': '#10b981',      // Green
      'SaaS / Tech': '#3b82f6',        // Blue
      'Professional Services': '#6366f1',    // Indigo
      'Healthcare & Medical': '#ef4444',      // Red
      'Education / EdTech': '#8b5cf6',      // Violet
      'Hospitality / Travel': '#f59e0b',     // Amber
      'Finance & Insurance': '#64748b',      // Slate
      'Manufacturing': '#84cc16',          // Lime
      'Other': '#6b7280'               // Gray
    }

    return colorMap[onboardingData.businessType] || '#6366f1'
  }

  // Generate capabilities list
  const generateCapabilities = (): string[] => {
    const capabilities = ['24/7 support', 'Multi-language', 'Intelligent responses']
    
    if (onboardingData.features.includes('CRM integration')) {
      capabilities.push('CRM integration', 'Customer history')
    }
    
    if (onboardingData.features.includes('Analytics and reporting')) {
      capabilities.push('Analytics dashboard', 'Performance insights')
    }
    
    if (onboardingData.features.includes('Multi-language support')) {
      capabilities.push('Language detection', 'Translation')
    }

    return capabilities
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an expert AI agent designer. Based on the following onboarding data, create a comprehensive AI agent configuration that perfectly matches the business needs and goals.

Onboarding Data:
${JSON.stringify(onboardingData, null, 2)}

Generate a detailed agent configuration that includes:
1. Agent name (creative and brand-aligned)
2. System prompt (comprehensive and industry-specific)
3. Welcome message (tone-appropriate and engaging)
4. Quick prompts (relevant to business goals)
5. Lead capture message (conversion-focused)
6. Escalation triggers (business-appropriate)
7. Widget color (brand-aligned)
8. Capabilities list (comprehensive)

Return ONLY a JSON object with these exact keys:
{
  "name": "agent name",
  "systemPrompt": "detailed system prompt",
  "welcomeMessage": "welcome message",
  "quickPrompts": ["prompt1", "prompt2", ...],
  "leadMessage": "lead capture message",
  "escalationTriggers": ["trigger1", "trigger2", ...],
  "widgetColor": "#hexcolor",
  "capabilities": ["capability1", "capability2", ...]
}`
        },
        {
          role: 'user',
          content: 'Generate the AI agent configuration based on the provided onboarding data.'
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    if (!aiResponse) {
      throw new Error('Failed to generate agent configuration')
    }

    // Parse the JSON response
    const configMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!configMatch) {
      throw new Error('Invalid AI response format')
    }

    let config: GeneratedAgent
    try {
      config = JSON.parse(configMatch[0])
    } catch (error) {
      // Fallback to generated config if JSON parsing fails
      config = {
        name: generateAgentName(),
        systemPrompt: generateSystemPrompt(),
        welcomeMessage: generateWelcomeMessage(),
        quickPrompts: generateQuickPrompts(),
        leadMessage: generateLeadMessage(),
        escalationTriggers: generateEscalationTriggers(),
        widgetColor: generateWidgetColor(),
        capabilities: generateCapabilities()
      }
    }

    return config
  } catch (error) {
    console.error('Error generating agent config:', error)
    throw new Error('Failed to generate AI agent configuration')
  }
}
