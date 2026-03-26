import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { generateAgentConfig, OnboardingData } from '@/lib/agent-generator'
import { fireWebhook } from '@/lib/webhooks'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    clientId,
    businessName, businessUrl, businessType,
    industry, productsServices, priceRange,
    topFaqs, tone, competitors, goals, extraInfo
  } = req.body

  if (!clientId || !businessName || !businessType || 
      !productsServices || !topFaqs) {
    return res.status(400).json({ 
      error: 'Missing required fields' 
    })
  }

  try {
    // 1. Save onboarding submission
    await supabaseAdmin
      .from('onboarding_submissions')
      .insert({
        client_id: clientId,
        business_name: businessName,
        business_url: businessUrl,
        business_type: businessType,
        industry,
        products_services: productsServices,
        price_range: priceRange,
        top_faqs: topFaqs,
        tone: tone || 'friendly',
        competitors,
        goals,
        extra_info: extraInfo,
      })

    // 2. Generate agent config with DeepSeek
    const onboardingData: OnboardingData = {
      businessName, businessUrl, businessType,
      industry, productsServices, priceRange,
      topFaqs, tone: tone || 'friendly',
      competitors, goals, extraInfo,
    }

    const agentConfig = await generateAgentConfig(onboardingData)

    // 3. Save generated agent to database (status: pending review)
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        client_id: clientId,
        name: agentConfig.agentName,
        store_id: businessType.toLowerCase().replace(/\s+/g, '-'),
        system_prompt: agentConfig.systemPrompt,
        welcome_message: agentConfig.welcomeMessage,
        quick_prompts: agentConfig.quickPrompts,
        lead_field: agentConfig.leadField,
        lead_message: agentConfig.leadMessage,
        escalation_triggers: agentConfig.escalationTriggers,
        widget_color: agentConfig.widgetColor,
        status: 'pending_review',
        generation_raw: agentConfig,
      })
      .select()
      .single()

    if (agentError) throw agentError

    // 4. Mark client onboarding as completed
    await supabaseAdmin
      .from('clients')
      .update({
        business_url: businessUrl,
        business_type: businessType,
        onboarding_completed: true,
      })
      .eq('id', clientId)

    // 5. Notify you via n8n webhook
    fireWebhook('webhook/agent-ready-for-review', {
      event: 'agent.generated' as any,
      clientId,
      businessName,
      agentName: agentConfig.agentName,
      agentId: agent.id,
      businessType,
      reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/review/${agent.id}`,
      timestamp: new Date().toISOString(),
    })

    return res.status(200).json({
      success: true,
      agentId: agent.id,
      agentName: agentConfig.agentName,
      message: 'Agent generated successfully — pending review',
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/onboarding/submit]', message)
    return res.status(500).json({ 
      error: 'Failed to generate agent',
      detail: message 
    })
  }
}
