export class NVIDIA {
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey
    this.baseURL = baseURL
  }

  async chat(messages: any[], model: string = 'nvidia/nemotron-4-340b-instruct') {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('NVIDIA API error:', error)
      throw error
    }
  }

  async completion(prompt: string, model: string = 'nvidia/nemotron-4-340b-instruct') {
    try {
      const response = await fetch(`${this.baseURL}/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('NVIDIA API error:', error)
      throw error
    }
  }
}

export function getNVIDIAClient(): NVIDIA {
  const apiKey = process.env.NVIDIA_API_KEY
  const baseURL = process.env.NVIDIA_BASE_URL

  if (!apiKey || !baseURL) {
    throw new Error('NVIDIA API credentials not configured')
  }

  return new NVIDIA(apiKey, baseURL)
}
