import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSmartAgentConfig } from '@/lib/smartAgentGenerator'
import { fireWebhook } from '@/lib/webhooks'
import { onboardingRateLimiter, getClientIP } from '@/lib/rate-limiter'

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

  const ip = getClientIP(req)

  // Check onboarding rate limit (very restrictive)
  try {
    await onboardingRateLimiter.consume(ip)
  } catch {
    return res.status(429).json({
      error: 'Too many onboarding attempts. Please wait 30 minutes before trying again.',
      retryAfter: 1800
    })
  }

  try {
    const onboardingData: SmartOnboardingData = req.body

    console.log('[SMART_ONBOARDING] ===== START =====')
    console.log('[SMART_ONBOARDING] Body keys:', Object.keys(req.body || {}))
    console.log('[SMART_ONBOARDING] businessName:', onboardingData.businessName)
    console.log('[SMART_ONBOARDING] businessType:', onboardingData.businessType)

    // Validate required fields
    if (!onboardingData.businessName || !onboardingData.businessType) {
      console.log('[SMART_ONBOARDING] ERROR: Missing required fields')
      return res.status(400).json({ error: 'Business name and type are required' })
    }

    // Get user from session (you'll need to implement auth)
    const clientId = 'demo-user-id' // Replace with actual user ID from session

    // Ensure client exists before agent creation
    console.log('[SMART_ONBOARDING] Ensuring client record exists...')
    const { error: clientUpsertError } = await supabaseAdmin
      .from('clients')
      .upsert({
        id: clientId,
        business_name: onboardingData.businessName || 'Unknown',
        onboarding_completed: false,
      } as any, { onConflict: 'id', ignoreDuplicates: false })

    console.log('[SMART_ONBOARDING] Client upsert error:', clientUpsertError)
    if (clientUpsertError) {
      console.log('[SMART_ONBOARDING] FAILED at client upsert')
      return res.status(500).json({ error: 'Failed to create client record' })
    }

    // Generate AI agent configuration with cost optimization
    const agentConfig = await generateSmartAgentConfig(onboardingData)

    // Save onboarding submission
    const { data: submission, error: submissionError } = await (supabaseAdmin
      .from('onboarding_submissions') as any)
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
    console.log('[SMART_ONBOARDING] Creating agent for client:', clientId)
    const { data: agent, error: agentError } = await (supabaseAdmin
      .from('agents') as any)
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

    console.log('[SMART_ONBOARDING] Agent created:', agent?.id)
    console.log('[SMART_ONBOARDING] Agent error:', agentError)

    if (agentError) {
      console.error('[SMART_ONBOARDING] Agent creation error:', agentError)
      return res.status(500).json({ error: 'Failed to create agent' })
    }

    // Update client onboarding status
    const { error: clientUpdateError } = await (supabaseAdmin
      .from('clients') as any)
      .update({
        onboarding_completed: true,
        business_name: onboardingData.businessName,
        business_type: onboardingData.businessType,
        business_url: '', // Can be collected later
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', clientId)

    if (clientUpdateError) {
      console.error('[SMART_ONBOARDING] Client update error:', clientUpdateError)
      return res.status(500).json({ error: 'Failed to update client' })
    }

    // Fire webhook for admin notification
    await fireWebhook('webhook/agent-generated', {
      event: 'agent.generated',
      clientId: clientId,
      businessName: onboardingData.businessName,
      agentName: agentConfig.name,
      agentId: (agent as any).id,
      businessType: onboardingData.businessType,
      reviewUrl: `https://nexagent-one.vercel.app/admin/review/${(agent as any).id}`,
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({
      success: true,
      message: 'Smart onboarding completed successfully!',
      data: {
        submissionId: (submission as any).id,
        agentId: (agent as any).id,
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
