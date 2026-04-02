import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  business_name: string
  industry: string
  widget_installed: boolean
  agents: Array<{
    id: string
    name: string
    status: string
  }>
}

export default function InstallPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('html')

  useEffect(() => {
    fetchClientData()
  }, [])

  const fetchClientData = async () => {
    try {
      // For demo purposes, using a mock client ID
      // In production, this would come from user session
      const clientId = 'demo-user-id'
      
      const { data: clientData } = await (supabase
        .from('clients') as any)
        .select(`
          id,
          business_name,
          email,
          phone,
          website,
          industry,
          plan,
          created_at,
          agents(id, name, status)
        `)
        .eq('id', clientId)
        .single()

      if (clientData) {
        setClient(clientData)
      }
    } catch (error) {
      console.error('Failed to fetch client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const code = `<script 
  src="https://nexagent-one.vercel.app/widget.js"
  data-client="${client?.id}">
</script>`

    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platformInstructions = {
    html: {
      name: 'HTML',
      instructions: 'Paste the code before the </body> closing tag in your HTML file.',
      icon: '📄'
    },
    shopify: {
      name: 'Shopify',
      instructions: 'Go to Settings → Themes → Edit code → theme.liquid. Paste the code before </body>.',
      icon: '🛒'
    },
    wordpress: {
      name: 'WordPress',
      instructions: 'Go to Appearance → Theme Editor → footer.php. Paste the code before </body>.',
      icon: '📝'
    },
    wix: {
      name: 'Wix',
      instructions: 'Go to Settings → Custom Code → Add code. Paste in the "Body" section.',
      icon: '🎨'
    },
    other: {
      name: 'Other Platforms',
      instructions: 'Paste the code before the </body> closing tag of your website.',
      icon: '⚙️'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Install Your AI Agent - NexAgent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <DashboardLayout activeTab="install">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Install your AI agent
            </h1>
            <p className="text-lg text-gray-600">
              Add one line of code to your website
            </p>
          </div>

          {/* Code Block */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Widget Installation Code
              </h2>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`<script 
  src="https://nexagent-one.vercel.app/widget.js"
  data-client="${client?.id || 'YOUR_CLIENT_ID'}">
</script>`}</pre>
            </div>
          </div>

          {/* Platform Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Platform-specific Instructions
            </h2>
            
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {Object.entries(platformInstructions).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{platformInstructions[activeTab as keyof typeof platformInstructions].icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {platformInstructions[activeTab as keyof typeof platformInstructions].name}
                  </h3>
                  <p className="text-gray-600">
                    {platformInstructions[activeTab as keyof typeof platformInstructions].instructions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Live Preview
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={`/widget/${client?.id || 'demo'}`}
                className="w-full h-96"
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Installation Status
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  client?.widget_installed ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-gray-700">
                  {client?.widget_installed 
                    ? 'Widget active on your site' 
                    : 'Not detected yet — install the code above'
                  }
                </span>
              </div>
              
              {client?.widget_installed && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Active
                </span>
              )}
            </div>

            {!client?.widget_installed && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> After installing the code, refresh this page to see the updated status.
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </DashboardLayout>
    </>
  )
}
