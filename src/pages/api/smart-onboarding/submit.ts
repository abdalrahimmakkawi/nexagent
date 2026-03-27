import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSmartAgentConfig } from '@/lib/smartAgentGenerator'
import { fireWebhook } from '@/lib/webhooks'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const onboardingData: SmartOnboardingData = req.body

    // Validate required fields
    if (!onboardingData.businessName || !onboardingData.businessType) {
      return res.status(400).json({ error: 'Business name and type are required' })
    }

    // Get user from session (you'll need to implement auth)
    const clientId = 'demo-user-id' // Replace with actual user ID from session

    // Generate AI agent configuration
    const agentConfig = await generateSmartAgentConfig(onboardingData)

    // Save onboarding submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('onboarding_submissions')
      .insert({
        client_id: clientId,
        business_name: onboardingData.businessName,
        business_type: onboardingData.businessType,
        industry: onboardingData.industry,
        target_audience: onboardingData.targetAudience,
        main_goals: onboardingData.mainGoals,
        current_challenges: onboardingData.currentChallenges,
        preferred_tone: onboardingData.preferredTone,
        features: onboardingData.features,
        status: 'completed'
      })
      .select()
      .single()

    if (submissionError) {
      console.error('[SMART_ONBOARDING] Submission error:', submissionError)
      return res.status(500).json({ error: 'Failed to save onboarding data' })
    }

    // Save agent with generated config
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        client_id: clientId,
        name: agentConfig.name,
        system_prompt: agentConfig.systemPrompt,
        welcome_message: agentConfig.welcomeMessage,
        quick_prompts: agentConfig.quickPrompts,
        lead_message: agentConfig.leadMessage,
        escalation_triggers: agentConfig.escalationTriggers,
        widget_color: agentConfig.widgetColor,
        status: 'pending_review',
        generation_raw: {
          onboardingData,
          aiConfig: agentConfig,
          generatedAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (agentError) {
      console.error('[SMART_ONBOARDING] Agent creation error:', agentError)
      return res.status(500).json({ error: 'Failed to create agent' })
    }

    // Update client onboarding status
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .update({
        onboarding_completed: true,
        business_name: onboardingData.businessName,
        business_type: onboardingData.businessType,
        business_url: '', // Can be collected later
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', clientId)

    if (clientError) {
      console.error('[SMART_ONBOARDING] Client update error:', clientError)
      return res.status(500).json({ error: 'Failed to update client' })
    }

    // Fire webhook for admin notification
    await fireWebhook('webhook/smart-agent-generated', {
      event: 'smart.agent.generated',
      clientEmail: 'client@example.com', // Replace with actual client email
      clientName: onboardingData.businessName,
      businessType: onboardingData.businessType,
      industry: onboardingData.industry,
      agentName: agentConfig.name,
      agentId: agent.id,
      submissionId: submission.id,
      onboardingData: onboardingData,
      aiConfig: agentConfig,
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({
      success: true,
      message: 'Smart onboarding completed successfully!',
      data: {
        submissionId: submission.id,
        agentId: agent.id,
        agentName: agentConfig.name,
        nextSteps: [
          'Your AI agent is now being reviewed by our team',
          'You\'ll receive an email within 24 hours',
          'Once approved, you can access your agent in the dashboard'
        ]
      }
    })

  } catch (error) {
    console.error('[SMART_ONBOARDING]', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process smart onboarding'
    })
  }
}
