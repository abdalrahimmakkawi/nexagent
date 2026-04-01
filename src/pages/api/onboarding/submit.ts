import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { generateAgentConfig, OnboardingData } from '@/lib/agent-generator'
import { fireWebhook } from '@/lib/webhooks'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[ONBOARDING] ===== START =====')
  console.log('[ONBOARDING] Method:', req.method)
  console.log('[ONBOARDING] Body keys:', Object.keys(req.body || {}))
  
  const {
    clientId,
    businessName, businessUrl, businessType,
    industry, productsServices, priceRange,
    topFaqs, tone, competitors, goals, extraInfo
  } = req.body

  console.log('[ONBOARDING] clientId:', clientId)
  console.log('[ONBOARDING] businessName:', businessName)
  console.log('[ONBOARDING] businessType:', businessType)
  
  if (!clientId || !businessName || !businessType || 
      !productsServices || !topFaqs) {
    console.log('[ONBOARDING] ERROR: Missing required fields')
    return res.status(400).json({ 
      error: 'Missing required fields' 
    })
  }

  try {
    // Step 1: Ensure client record exists (upsert)
    console.log('[ONBOARDING] Ensuring client record exists...')
    const { data: clientRecord, error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert({
        id: clientId,
        business_name: businessName,
        business_type: businessType,
        onboarding_completed: false,
      } as any, { onConflict: 'id', ignoreDuplicates: false })
      .select()
      .single()

    console.log('[ONBOARDING] Client upsert result:', clientRecord)
    console.log('[ONBOARDING] Client upsert error:', clientError)
    
    if (clientError) {
      console.log('[ONBOARDING] FAILED at client upsert')
      return res.status(500).json({ 
        error: 'Failed to create client record',
        detail: clientError.message 
      })
    }

    // Step 2: Save onboarding submission
    console.log('[ONBOARDING] Saving onboarding submission...')
    const { data: submission, error: submissionError } = 
      await supabaseAdmin
        .from('onboarding_submissions')
        .insert({
          client_id: clientId,
          business_name: businessName,
          business_type: businessType || 'General',
          industry: industry || 'General',
          products_services: productsServices || '',
          top_faqs: topFaqs || '',
          tone: tone || 'friendly',
        } as any)
        .select()
        .single()
    
    console.log('[ONBOARDING] Submission saved:', submission?.id)
    console.log('[ONBOARDING] Submission error:', submissionError)
    
    if (submissionError) {
      console.log('[ONBOARDING] FAILED at submission save')
      return res.status(500).json({ 
        error: 'Failed to save submission',
        detail: submissionError.message 
      })
    }

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
      // First check if client already exists
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id, email')
        .eq('id', clientId)
        .single()

      if (!existingClient) {
        // Client doesn't exist - get email from auth
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(clientId)
        const userEmail = user?.email || `client-${clientId}@placeholder.com` 
        
        await supabaseAdmin
          .from('clients')
            .insert({
              id: clientId,
              email: userEmail,
              business_name: businessName,
              business_type: businessType,
              industry: industry,
            } as any)
      }
    } catch (clientErr) {
      console.error('Client ensure failed:', clientErr)
    }

    // 3. Generate agent config with DeepSeek (with fallback)
    console.log('[ONBOARDING] Starting agent generation...')
    let agentConfig
    try {
      const onboardingData: OnboardingData = {
        businessName, businessUrl, businessType,
        industry, productsServices, priceRange,
        topFaqs, tone: tone || 'friendly',
        competitors, goals, extraInfo,
      }

      console.log('[ONBOARDING] Onboarding data prepared:', Object.keys(onboardingData))
      agentConfig = await generateAgentConfig(onboardingData)
      console.log('[ONBOARDING] Agent config generated successfully')
    } catch (configErr) {
      console.warn('[ONBOARDING] Agent config generation failed:', configErr)
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
    console.log('[ONBOARDING] Creating agent in database...')
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

    console.log('[ONBOARDING] Agent created with status:', agent?.status, 'ID:', agent?.id)

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
