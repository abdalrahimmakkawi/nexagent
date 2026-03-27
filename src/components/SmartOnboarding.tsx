"use client";

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Building,
  Users,
  Target,
  Zap
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface OnboardingData {
  businessName: string
  businessType: string
  industry: string
  targetAudience: string
  mainGoals: string[]
  currentChallenges: string[]
  preferredTone: string
  features: string[]
}

interface SmartQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multiselect' | 'textarea'
  options?: string[]
  context?: string[]
  followUp?: string
}

export default function SmartOnboarding() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    industry: '',
    targetAudience: '',
    mainGoals: [],
    currentChallenges: [],
    preferredTone: 'professional',
    features: []
  })
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const smartQuestions: SmartQuestion[] = [
    {
      id: 'business-name',
      question: "What's your business name?",
      type: 'text',
      context: ['This helps personalize the agent with your brand'],
      followUp: "Great! And what type of business is this?"
    },
    {
      id: 'business-type',
      question: "What type of business do you run?",
      type: 'select',
      options: [
        'E-commerce / Retail',
        'SaaS / Tech',
        'Professional Services',
        'Healthcare',
        'Education / EdTech',
        'Hospitality / Travel',
        'Manufacturing',
        'Financial Services',
        'Other'
      ],
      context: ['Different business types have different customer service needs'],
      followUp: "Perfect! What industry would you say you're in?"
    },
    {
      id: 'industry',
      question: "What industry do you operate in?",
      type: 'select',
      options: [
        'Technology & Software',
        'Retail & E-commerce',
        'Healthcare & Medical',
        'Finance & Insurance',
        'Education & Training',
        'Professional Services',
        'Manufacturing & Industrial',
        'Hospitality & Tourism',
        'Media & Entertainment',
        'Government & Non-profit',
        'Other'
      ],
      context: ['Industry-specific terminology and regulations matter'],
      followUp: "Got it! Who is your target audience?"
    },
    {
      id: 'target-audience',
      question: "Who is your primary target audience?",
      type: 'text',
      context: ['This helps the agent understand customer demographics and communication style'],
      followUp: "Excellent! What are your main goals for this AI agent?"
    },
    {
      id: 'main-goals',
      question: "What are your main goals for this AI agent? (Select all that apply)",
      type: 'multiselect',
      options: [
        '24/7 customer support',
        'Lead generation and qualification',
        'Appointment booking',
        'Product recommendations',
        'Order tracking and returns',
        'Technical support',
        'Sales assistance',
        'Customer onboarding',
        'Feedback collection',
        'FAQ automation',
        'Cost reduction',
        'Multi-language support'
      ],
      context: ['This determines the agent\'s primary functions and priorities'],
      followUp: "Great! What challenges are you currently facing with customer service?"
    },
    {
      id: 'current-challenges',
      question: "What challenges are you currently facing with customer service?",
      type: 'multiselect',
      options: [
        'High volume of repetitive questions',
        'After-hours support demands',
        'Inconsistent responses from staff',
        'Language barriers with customers',
        'Slow response times',
        'High operational costs',
        'Difficulty scaling support',
        'Staff training and turnover',
        'Customer satisfaction issues',
        'Limited support channels',
        'Lack of customer insights',
        'Manual process inefficiencies'
      ],
      context: ['This helps us address specific pain points'],
      followUp: "I understand. What tone should your agent have?"
    },
    {
      id: 'preferred-tone',
      question: "What tone should your agent have?",
      type: 'select',
      options: [
        'Professional and formal',
        'Friendly and casual',
        'Technical and precise',
        'Empathetic and supportive',
        'Enthusiastic and energetic',
        'Concise and direct'
      ],
      context: ['Tone affects how customers perceive your brand'],
      followUp: "Perfect! Any specific features you need?"
    },
    {
      id: 'features',
      question: "Any specific features or capabilities you need? (Select all that apply)",
      type: 'multiselect',
      options: [
        'Live chat integration',
        'Email ticketing system',
        'Phone/SMS support',
        'Social media integration',
        'CRM integration',
        'Knowledge base management',
        'Analytics and reporting',
        'Multi-language support',
        'File/document sharing',
        'Appointment scheduling',
        'Payment processing',
        'Escalation to human',
        'Custom branding',
        'Mobile app support',
        'API access',
        'Voice/chatbot integration'
      ],
      context: ['These determine the technical requirements'],
      followUp: "Excellent! I have all the information I need. Let me build your perfect AI agent configuration."
    }
  ]

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateFollowUpQuestion = (questionId: string) => {
    const question = smartQuestions.find(q => q.id === questionId)
    return question?.followUp || ''
  }

  const processUserResponse = (response: string) => {
    const question = smartQuestions[currentQuestion]
    
    // Update onboarding data based on response
    switch (question.id) {
      case 'business-name':
        setOnboardingData(prev => ({ ...prev, businessName: response }))
        break
      case 'business-type':
        setOnboardingData(prev => ({ ...prev, businessType: response }))
        break
      case 'industry':
        setOnboardingData(prev => ({ ...prev, industry: response }))
        break
      case 'target-audience':
        setOnboardingData(prev => ({ ...prev, targetAudience: response }))
        break
      case 'main-goals':
        setOnboardingData(prev => ({ ...prev, mainGoals: response.split(', ').filter(g => g.trim()) }))
        break
      case 'current-challenges':
        setOnboardingData(prev => ({ ...prev, currentChallenges: response.split(', ').filter(g => g.trim()) }))
        break
      case 'preferred-tone':
        setOnboardingData(prev => ({ ...prev, preferredTone: response }))
        break
      case 'features':
        setOnboardingData(prev => ({ ...prev, features: response.split(', ').filter(g => g.trim()) }))
        break
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: response,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Generate AI response
    setTimeout(() => {
      generateAIResponse(question.id, response)
    }, 500)
  }

  const generateAIResponse = (questionId: string, userResponse: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const question = smartQuestions[currentQuestion]
      let aiResponse = ''

      // Generate contextual responses
      switch (questionId) {
        case 'business-name':
          aiResponse = `Great to meet you, ${userResponse}! I'm excited to help build your AI agent. A strong business name is the foundation of your brand identity.`
          break
        case 'business-type':
          aiResponse = `Perfect! ${userResponse} businesses have unique customer service needs. I'll make sure your agent is optimized for ${userResponse.toLowerCase()} operations.`
          break
        case 'industry':
          aiResponse = `Excellent! The ${userResponse} industry has specific requirements and terminology. Your agent will be industry-expert and compliant.`
          break
        case 'target-audience':
          aiResponse = `Perfect! Understanding your ${userResponse} audience is crucial. Your agent will speak their language and address their specific needs.`
          break
        case 'main-goals':
          const goals = userResponse.split(', ').map(g => g.trim())
          aiResponse = `Fantastic! I see you want to focus on: ${goals.join(', ')}. Your agent will be optimized for these specific objectives.`
          break
        case 'current-challenges':
          const challenges = userResponse.split(', ').map(c => c.trim())
          aiResponse = `I understand these challenges: ${challenges.join(', ')}. Your AI agent will directly address these pain points.`
          break
        case 'preferred-tone':
          aiResponse = `Perfect! Your agent will have a ${userResponse} tone that matches your brand personality.`
          break
        case 'features':
          const features = userResponse.split(', ').map(f => f.trim())
          aiResponse = `Excellent! I'll ensure your agent has: ${features.join(', ')}. These capabilities will give you a competitive edge.`
          break
      }

      // Add follow-up question if available
      if (question.followUp) {
        aiResponse += `\n\n${generateFollowUpQuestion(question.id)}`
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)

      // Move to next question
      if (currentQuestion < smartQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1)
          const nextQuestion = smartQuestions[currentQuestion + 1]
          const nextAI: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: nextQuestion.question,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, nextAI])
        }, 1500)
      } else {
        // Complete onboarding
        setTimeout(() => {
          setIsComplete(true)
          const completionMessage: Message = {
            id: (Date.now() + 3).toString(),
            role: 'assistant',
            content: `🎉 **Onboarding Complete!**\n\nI've gathered all the information needed to create your perfect AI agent. Here's what I've learned:\n\n**Business:** ${onboardingData.businessName}\n**Type:** ${onboardingData.businessType}\n**Industry:** ${onboardingData.industry}\n**Audience:** ${onboardingData.targetAudience}\n**Goals:** ${onboardingData.mainGoals.join(', ')}\n**Tone:** ${onboardingData.preferredTone}\n**Features:** ${onboardingData.features.join(', ')}\n\nYour agent is now being configured with these specifications. You'll receive an email once it's ready for review!`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, completionMessage])
        }, 2000)
      }
    }, 1000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const question = smartQuestions[currentQuestion]
    
    if (question.type === 'select' || question.type === 'multiselect') {
      // Handle selection
      processUserResponse(inputValue)
    } else {
      // Handle text input
      processUserResponse(inputValue)
    }
    
    setInputValue('')
  }

  const renderQuestionInput = () => {
    const question = smartQuestions[currentQuestion]
    
    if (question.type === 'select') {
      return (
        <select 
          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900"
          onChange={(e) => {
            setInputValue(e.target.value)
            processUserResponse(e.target.value)
          }}
          value={inputValue}
        >
          <option value="">Select an option...</option>
          {question.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )
    }

    if (question.type === 'multiselect') {
      return (
        <div className="space-y-2">
          {question.options?.map(option => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={inputValue.includes(option)}
                onChange={(e) => {
                  const checked = e.target.checked
                  const newValue = checked 
                    ? [...inputValue.split(', ').filter(v => v.trim() !== option), option]
                    : inputValue.split(', ').filter(v => v.trim() !== option)
                  setInputValue(newValue.join(', '))
                }}
                className="rounded"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )
    }

    return (
      <Textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your response here..."
        className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 resize-none"
        rows={question.type === 'textarea' ? 4 : 1}
      />
    )
  }

  const renderContextInfo = () => {
    const question = smartQuestions[currentQuestion]
    if (!question.context || question.context.length === 0) return null

    return (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Why this matters:</p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              {question.context.map((context, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <span>{context}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Onboarding Complete!
            </h1>
            <p className="text-gray-600 mb-8">
              Your AI agent is now being configured with your specifications. You'll receive an email once it's ready for review.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Configuration Summary:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-700">Business:</strong> {onboardingData.businessName}
                </div>
                <div>
                  <strong className="text-gray-700">Type:</strong> {onboardingData.businessType}
                </div>
                <div>
                  <strong className="text-gray-700">Industry:</strong> {onboardingData.industry}
                </div>
                <div>
                  <strong className="text-gray-700">Audience:</strong> {onboardingData.targetAudience}
                </div>
                <div>
                  <strong className="text-gray-700">Goals:</strong> {onboardingData.mainGoals.join(', ')}
                </div>
                <div>
                  <strong className="text-gray-700">Tone:</strong> {onboardingData.preferredTone}
                </div>
                <div>
                  <strong className="text-gray-700">Features:</strong> {onboardingData.features.join(', ')}
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard →
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Onboarding</h1>
              <p className="text-sm text-gray-600">AI-powered agent configuration</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentQuestion + 1} of {smartQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestion + 1) / smartQuestions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / smartQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {/* Chat Messages */}
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto" style={{ height: '500px' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl",
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      )}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-xs font-medium">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <div className="text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 border border-gray-200 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Question Panel */}
            <div className="w-full lg:w-96 p-6 bg-white border-l border-gray-200">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {smartQuestions[currentQuestion].question}
                </h2>
                {renderContextInfo()}
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                {renderQuestionInput()}
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && isTyping}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Tips:</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-blue-600" />
                    <span>Be specific about your needs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span>Think about your customers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <span>Consider future growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
