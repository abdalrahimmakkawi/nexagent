import OpenAI from 'openai'

// NVIDIA is OpenAI-compatible — same SDK, different URL
const nvidia = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || 
    'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY || '',
})

const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || 
    'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
})

// Use NVIDIA if key exists, fallback to DeepSeek
export const aiClient = process.env.NVIDIA_API_KEY 
  ? nvidia 
  : deepseek

export const aiModel = process.env.NVIDIA_API_KEY
  ? (process.env.NVIDIA_MODEL || 
     'nvidia/llama-3.1-nemotron-ultra-253b-v1')
  : (process.env.DEEPSEEK_MODEL || 'deepseek-chat')

export const providerName = process.env.NVIDIA_API_KEY
  ? 'nvidia'
  : 'deepseek'

// Test the connection
export async function testAIConnection(): Promise<boolean> {
  try {
    const response = await aiClient.chat.completions.create({
      model: aiModel,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hi' }],
    })
    return !!response.choices[0]?.message?.content
  } catch (err) {
    console.error('[AI Client] Connection test failed:', err)
    return false
  }
}

// Filter out thinking content from NVIDIA responses
export function processAIResponse(response: any): string {
  let content = response.choices?.[0]?.message?.content || ''
  
  // If response has reasoning_content, extract only the actual content
  if (response.choices?.[0]?.message?.reasoning_content) {
    // For models that separate reasoning from content
    content = response.choices[0].message.content || ''
  }
  
  // Remove any thinking/reasoning tags that might be in the content
  content = content
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/```thinking[\s\S]*?```/gi, '')
    .replace(/```reasoning[\s\S]*?```/gi, '')
    .trim()
  
  return content
}
