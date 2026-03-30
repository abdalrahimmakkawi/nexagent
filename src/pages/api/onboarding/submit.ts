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
    await (supabaseAdmin
      .from('onboarding_submissions') as any)
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

    // 2. Auto-assign squad plan for all clients (with fallback)
    try {
      await supabaseAdmin
        .from('agent_teams')
        .upsert({
          client_id: clientId,
          plan: 'squad',
          active_agents: [
            'router', 'support', 'sales', 'faq',
            'escalation', 'followup', 'analytics', 'onboarding'
          ],
          updated_at: new Date().toISOString(),
        } as any)
    } catch (planErr) {
      console.warn('Plan upsert failed:', planErr)
      // Non-blocking — continue
    }

    // 2.5. Ensure client exists before creating agent (fixes foreign key constraint)
    try {
      await supabaseAdmin
        .from('clients')
        .upsert({ id: clientId } as any, { onConflict: 'id', ignoreDuplicates: true } as any)
    } catch (clientErr) {
      console.warn('Client upsert failed:', clientErr)
      // Non-blocking — continue
    }

    // 3. Generate agent config with DeepSeek (with fallback)
    let agentConfig
    try {
      const onboardingData: OnboardingData = {
        businessName, businessUrl, businessType,
        industry, productsServices, priceRange,
        topFaqs, tone: tone || 'friendly',
        competitors, goals, extraInfo,
      }

      agentConfig = await generateAgentConfig(onboardingData)
    } catch (configErr) {
      console.warn('Agent config generation failed:', configErr)
      // Fallback to basic config
      agentConfig = {
        agentName: `${businessName} AI Assistant`,
        systemPrompt: `You are a helpful AI assistant for ${businessName}. You help with customer inquiries, provide information about services, and assist with common questions.`,
        welcomeMessage: `Welcome to ${businessName}! How can I help you today?`,
        quickPrompts: [
          "What services do you offer?",
          "What are your hours?",
          "How can I contact you?"
        ],
        leadField: 'email',
        leadMessage: 'Thank you for your interest! Please provide your email and we\'ll get back to you soon.',
        escalationTriggers: ['human agent', 'complaint'],
        widgetColor: '#6366f1',
      }
    }

    // 4. Save generated agent to database (status: pending review)
    const { data: agent, error: agentError } = await (supabaseAdmin
      .from('agents') as any)
      .insert({
        client_id: clientId,
        name: agentConfig.agentName || `${businessName} AI Assistant`,
        store_id: businessType?.toLowerCase().replace(/\s+/g, '-') || 'default',
        system_prompt: agentConfig.systemPrompt,
        welcome_message: agentConfig.welcomeMessage,
        quick_prompts: agentConfig.quickPrompts || [],
        lead_field: agentConfig.leadField || 'email',
        lead_message: agentConfig.leadMessage || 'Thank you for your interest!',
        escalation_triggers: agentConfig.escalationTriggers || [],
        widget_color: agentConfig.widgetColor || '#6366f1',
        status: 'pending_review',
        generation_raw: agentConfig,
      })
      .select()
      .single()

    if (agentError) {
      console.error('Agent insert FULL error:', JSON.stringify(agentError, null, 2))
      return res.status(500).json({ error: 'Agent insert failed', detail: agentError.message, code: agentError.code, hint: agentError.hint })
    }

    // 5. Mark client onboarding as completed (with fallback)
    try {
      await (supabaseAdmin
        .from('clients') as any)
        .update({
          business_url: businessUrl,
          business_type: businessType,
          onboarding_completed: true,
        })
        .eq('id', clientId)
    } catch (updateErr) {
      console.warn('Client update failed:', updateErr)
      // Non-blocking — continue
    }

    // 5. Notify you via n8n webhook
    fireWebhook('webhook/agent-ready-for-review', {
      event: 'agent.generated' as any,
      clientId,
      businessName,
      agentName: agentConfig.agentName,
      agentId: (agent as any).id,
      businessType,
      reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/review/${(agent as any).id}`,
      timestamp: new Date().toISOString(),
    })

    return res.status(200).json({
      success: true,
      agentId: (agent as any).id,
      agentName: agentConfig.agentName,
      message: 'Agent generated successfully — pending review',
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/onboarding/submit] Full error:', message)
    console.error('[/api/onboarding/submit] Request body:', JSON.stringify({
      clientId,
      businessName,
      businessType,
      industry,
      productsServices,
      topFaqs,
      tone,
      selectedPlan: 'squad'
    }))
    console.error('[/api/onboarding/submit] Stack trace:', err instanceof Error ? err.stack : 'No stack trace available')
    
    return res.status(500).json({ 
      error: 'Failed to generate agent',
      detail: message 
    })
  }
}
