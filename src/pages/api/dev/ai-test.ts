import type { NextApiRequest, NextApiResponse } from 'next'
import { testAIConnection, providerName, aiModel } 
  from '@/lib/nvidia-client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NODE_ENV === 'production' &&
      req.headers['x-admin-key'] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const working = await testAIConnection()
  
  return res.status(200).json({
    provider: providerName,
    model: aiModel,
    connected: working,
    timestamp: new Date().toISOString(),
  })
}
