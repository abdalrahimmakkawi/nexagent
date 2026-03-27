import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'

interface CollectiveBrainData {
  learningData: {
    totalConversations: number
    totalMessages: number
    commonQuestions: Array<{ question: string; frequency: number; successRate: number }>
    effectiveResponses: Array<{ response: string; context: string; rating: number }>
    industryInsights: Record<string, any>
    escalationPatterns: Array<{ trigger: string; resolution: string }>
    leadCaptureSuccess: Array<{ method: string; conversionRate: number }>
  }
  insights: string[]
  recommendations: string[]
  lastUpdated: string
}

export default function CollectiveBrain() {
  const [brainData, setBrainData] = useState<CollectiveBrainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBrainData()
  }, [])

  const fetchBrainData = async () => {
    try {
      const response = await fetch('/api/collective-brain')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch brain data')
      }

      setBrainData(data)
    } catch (err) {
      console.error('Failed to fetch brain data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="overview">
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-800 rounded-lg"></div>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout activeTab="overview">
        <div className="p-8">
          <div className="text-center">
            <Icon name="message" size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#fff' }}>
              Unable to load collective brain data
            </h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchBrainData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!brainData) {
    return null
  }

  return (
    <>
      <Head>
        <title>Collective Brain - NexAgent Dashboard</title>
      </Head>

      <DashboardLayout activeTab="overview">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              🧠 Collective Brain Intelligence
            </h1>
            <p className="text-gray-400">
              Real-time insights from thousands of customer conversations across all NexAgent agents
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Conversations Analyzed</span>
                <Icon name="message" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-2xl font-bold text-white">{brainData.learningData.totalConversations.toLocaleString()}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Messages Processed</span>
                <Icon name="message" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-2xl font-bold text-white">{brainData.learningData.totalMessages.toLocaleString()}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Common Questions</span>
                <Icon name="target" size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="text-2xl font-bold text-white">{brainData.learningData.commonQuestions.length}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Effective Responses</span>
                <Icon name="check" size={20} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold text-green-400">{brainData.learningData.effectiveResponses.length}</div>
            </div>
          </div>

          {/* Common Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Icon name="target" size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
                  Top Customer Questions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {brainData.learningData.commonQuestions.slice(0, 8).map((question, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {question.question.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-400">
                          {question.frequency} times asked • {Math.round(question.successRate * 100)}% success rate
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (question.frequency / Math.max(...brainData.learningData.commonQuestions.map(q => q.frequency))) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Effective Responses */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Icon name="check" size={20} style={{ marginRight: '8px', color: '#22c55e' }} />
                  High-Performing Responses
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {brainData.learningData.effectiveResponses.slice(0, 6).map((response, index) => (
                    <div key={index} className="border-l-2 border-green-500 pl-4">
                      <div className="text-gray-300 text-sm mb-1">{response.context}...</div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-400">Rating:</div>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < Math.round(response.rating * 5) ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(response.rating * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Industry Insights */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Icon name="bar-chart" size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
                Industry-Specific Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(brainData.learningData.industryInsights).slice(0, 6).map(([industry, data]: [string, any]) => (
                  <div key={industry} className="bg-gray-700 rounded-lg p-4">
                    <div className="text-white font-medium mb-2">{industry}</div>
                    <div className="text-sm text-gray-400">
                      <div>{data.conversationCount} conversations</div>
                      <div>Avg {Math.round(data.averageMessages || 0)} messages</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Icon name="sparkle" size={20} style={{ marginRight: '8px', color: '#f59e0b' }} />
                  Key Insights
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {brainData.insights.map((insight, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <Icon name="check" size={16} style={{ color: '#22c55e', marginRight: '8px', marginTop: '2px' }} />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Icon name="bolt" size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
                  Recommendations
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {brainData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <Icon name="arrow-right" size={16} style={{ color: '#6366f1', marginRight: '8px', marginTop: '2px' }} />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-400">
            Last updated: {new Date(brainData.lastUpdated).toLocaleString()}
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
