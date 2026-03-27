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
    'Technology & Software': 'You are an AI customer support agent for a technology/SaaS company. Help with technical troubleshooting, bug reports, feature requests, and user onboarding.',
    'Retail & E-commerce': 'You are an AI customer support agent for an e-commerce business. Help with order tracking, returns, product recommendations, shipping inquiries.',
    'Healthcare & Medical': 'You are an AI assistant for a healthcare provider. Help with appointment scheduling, basic medical inquiries, insurance questions.',
    'Finance & Insurance': 'You are an AI support agent for a financial services company. Help with account inquiries, transaction support, basic financial questions.',
    'Education & Training': 'You are an AI educational assistant. Help with course information, enrollment, technical support, and student guidance.',
    'Professional Services': 'You are an AI assistant for a professional services firm. Help with client inquiries, appointment scheduling, service information.',
    'Manufacturing & Industrial': 'You are an AI support agent for a manufacturing company. Help with product inquiries, technical specifications, order support.',
    'Hospitality & Tourism': 'You are an AI hospitality assistant. Help with reservations, customer inquiries, service information, travel support.',
    'Media & Entertainment': 'You are an AI assistant for a media/entertainment company. Help with content inquiries, customer support, technical assistance.',
    'Government & Non-profit': 'You are an AI assistant for a government or non-profit organization. Help with public inquiries, service information, administrative support.'
  }

  // Create tone-specific guidelines
  const toneGuidelines: Record<string, string> = {
    'Professional and formal': 'Use formal language, proper grammar, and a respectful tone.',
    'Friendly and casual': 'Use conversational language, contractions where appropriate, and a warm, approachable tone.',
    'Technical and precise': 'Use accurate technical terminology, be specific and detailed.',
    'Empathetic and supportive': 'Use understanding language, acknowledge customer concerns, and provide reassurance.',
    'Enthusiastic and energetic': 'Use positive, energetic language, and an upbeat tone.',
    'Concise and direct': 'Use short, clear sentences. Get straight to the point.'
  }

  // Generate agent name based on business
  const generateAgentName = (): string => {
    const businessName = onboardingData.businessName.trim()
    const businessType = onboardingData.businessType.toLowerCase()
    
    if (businessName.toLowerCase().includes('ai') || businessName.toLowerCase().includes('bot')) {
      return businessName
    }
    
    const nameSuggestions: Record<string, string> = {
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

  // Generate system prompt (optimized to reduce tokens)
  const generateSystemPrompt = (): string => {
    const industryPrompt = industryPrompts[onboardingData.industry] || industryPrompts['Professional Services']
    const toneGuideline = toneGuidelines[onboardingData.preferredTone] || toneGuidelines['Professional and formal']
    
    return `${industryPrompt} ${toneGuideline}

Company: ${onboardingData.businessName}
Type: ${onboardingData.businessType}
Industry: ${onboardingData.industry}
Audience: ${onboardingData.targetAudience}
Goals: ${onboardingData.mainGoals.join(', ')}
Tone: ${onboardingData.preferredTone}

Be helpful, accurate, and professional. If you don't know something, admit it honestly. Focus on solving problems efficiently.`
  }

  // Generate welcome message
  const generateWelcomeMessage = (): string => {
    const greetings: Record<string, string> = {
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
      basePrompts.push('I need urgent help', 'Check order status')
    }
    
    if (onboardingData.mainGoals.includes('Lead generation and qualification')) {
      basePrompts.push('Get a quote', 'Schedule consultation')
    }
    
    if (onboardingData.mainGoals.includes('Appointment booking')) {
      basePrompts.push('Book appointment', 'Check availability')
    }
    
    if (onboardingData.mainGoals.includes('Product recommendations')) {
      basePrompts.push('Product suggestions', 'Find similar items')
    }

    return basePrompts.slice(0, 6)
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
    // Use a much more concise prompt to save tokens
    const concisePrompt = `Generate AI agent config for:
Business: ${onboardingData.businessName}
Type: ${onboardingData.businessType}
Industry: ${onboardingData.industry}
Audience: ${onboardingData.targetAudience}
Goals: ${onboardingData.mainGoals.join(', ')}
Tone: ${onboardingData.preferredTone}

Return JSON with: name, systemPrompt, welcomeMessage, quickPrompts[6], leadMessage, escalationTriggers, widgetColor, capabilities`

    const completion = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI agent designer. Generate concise, practical configurations based on business needs. Return only valid JSON.'
        },
        {
          role: 'user',
          content: concisePrompt
        }
      ],
      temperature: 0.3, // Reduced for more consistent output
      max_tokens: 800 // Reduced from 2000 to save costs
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
