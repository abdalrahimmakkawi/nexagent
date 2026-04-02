import type { NextApiRequest, NextApiResponse } from 'next'
import { runPlanningAgent } from '@/lib/planning-agent'
import { getToolsForPlan } from '@/lib/agent-tools'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { message, plan = 'team' } = req.body

  try {
    // Get tools for the plan
    const availableTools = getToolsForPlan(plan)
    
    // Mock agent context
    const agentContext = {
      clientId: 'test-client',
      agentId: 'test-agent',
      businessName: 'Test Business'
    }

    // Mock system prompt
    const systemPrompt = 'You are a helpful AI assistant that can book appointments, send emails, and create leads using available tools.'
    
    // Mock conversation history
    const conversationHistory: any[] = []

    // Run planning agent
    const result = await runPlanningAgent(
      message,
      availableTools,
      systemPrompt,
      conversationHistory,
      agentContext
    )

    return res.status(200).json({
      success: true,
      message: 'Planning agent test completed',
      input: {
        message,
        plan,
        toolsAvailable: availableTools.length,
        toolsList: availableTools.map(t => t.name)
      },
      output: {
        response: result.response,
        actionsExecuted: result.actionsExecuted,
        hadPlan: !!result.plan,
        plan: result.plan
      }
    })

  } catch (error) {
    console.error('[TEST_PLANNING_AGENT] Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
