import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check environment variables
    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

    if (!apiKey) {
      return res.status(500).json({
        error: 'DEEPSEEK_API_KEY not configured',
        envStatus: {
          apiKey: '❌ Missing',
          baseUrl: baseUrl,
          model: model
        }
      })
    }

    // Create OpenAI client
    const openai = new OpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    })

    // Test API call
    const response = await openai.chat.completions.create({
      model: model,
      max_tokens: 50,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello from DeepSeek!"' }
      ],
    })

    const content = response.choices[0]?.message?.content

    return res.status(200).json({
      success: true,
      message: 'DeepSeek API test successful',
      response: content,
      envStatus: {
        apiKey: '✅ Set',
        baseUrl: baseUrl,
        model: model,
        apiKeyLength: apiKey.length
      },
      testTimestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[DEEPSEEK_TEST] Error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'DeepSeek API test failed',
      details: error.message,
      envStatus: {
        apiKey: process.env.DEEPSEEK_API_KEY ? '✅ Set' : '❌ Missing',
        baseUrl: process.env.DEEPSEEK_BASE_URL || '❌ Missing',
        model: process.env.DEEPSEEK_MODEL || '❌ Missing'
      }
    })
  }
}
