import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check environment variables (without exposing sensitive data)
  const envStatus = {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY ? '✅ Set' : '❌ Missing',
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || '❌ Missing',
    deepseekModel: process.env.DEEPSEEK_MODEL || '❌ Missing',
    apiKeyLength: process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0,
    apiKeyPrefix: process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.substring(0, 7) + '...' : 'None'
  }

  return res.status(200).json({
    status: 'Environment variables check',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    envStatus
  })
}
