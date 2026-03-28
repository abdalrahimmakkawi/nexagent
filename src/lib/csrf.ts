import { NextApiRequest, NextApiResponse } from 'next'

const CSRF_HEADER = 'x-nexagent-request'
const CSRF_VALUE = 'true'

// All state-changing API routes must include
// the x-nexagent-request: true header
// This prevents cross-site request forgery

export function validateCSRF(
  req: NextApiRequest,
  res: NextApiResponse
): boolean {
  // Skip for GET requests
  if (req.method === 'GET') return true

  const header = req.headers[CSRF_HEADER]
  if (header !== CSRF_VALUE) {
    res.status(403).json({ error: 'Invalid request origin' })
    return false
  }
  return true
}
