import { z } from 'zod'

// Chat message validation
export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
      .min(1, 'Message cannot be empty')
      .max(400, 'Message too long')
      .refine(
        val => !/<script/i.test(val),
        'Invalid content'
      )
      .refine(
        val => !/javascript:/i.test(val),
        'Invalid content'
      ),
  })).min(1).max(50),
  storeId: z.string().min(1).max(50).optional(),
})

// Waitlist validation
export const WaitlistSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .max(254)
    .transform(val => val.toLowerCase().trim()),
  businessName: z.string().min(1).max(100).optional(),
  businessType: z.string().min(1).max(50).optional(),
  message: z.string().max(200).optional(),
})

// Lead capture validation
export const LeadSchema = z.object({
  value: z.string().min(1).max(254),
  fieldType: z.enum(['email', 'phone']),
  storeId: z.string().min(1).max(50),
  storeName: z.string().min(1).max(100),
})

// Onboarding validation
export const OnboardingSchema = z.object({
  clientId: z.string().uuid(),
  businessName: z.string().min(2).max(100),
  businessUrl: z.string().url().optional().or(z.literal('')),
  businessType: z.string().min(2).max(50),
  industry: z.string().min(2).max(50),
  productsServices: z.string().min(10).max(2000),
  priceRange: z.string().max(50).optional(),
  topFaqs: z.string().min(10).max(2000),
  tone: z.enum([
    'friendly', 'professional', 
    'enthusiastic', 'calm'
  ]),
  competitors: z.string().max(500).optional(),
  goals: z.string().max(500).optional(),
  extraInfo: z.string().max(1000).optional(),
})

// Widget chat validation
export const WidgetChatSchema = z.object({
  clientId: z.string().min(1).max(100),
  agentId: z.string().uuid(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(400),
  })).min(1).max(50),
  sessionId: z.string().min(1).max(100),
  conversationId: z.string().uuid().optional(),
})

// Admin approval validation
export const AdminApprovalSchema = z.object({
  agentId: z.string().uuid(),
})

// Sanitize text input
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .trim()
}

// Validate and sanitize all message content
export function sanitizeMessages(
  messages: {role: string, content: string}[]
): {role: string, content: string}[] {
  return messages.map(m => ({
    ...m,
    content: sanitizeInput(m.content).slice(0, 400)
  }))
}
