import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/Icon'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
}

const navItems = [
  { key: 'overview', label: 'Overview', href: '/dashboard', icon: 'store' },
  { key: 'conversations', label: 'Conversations', href: '/dashboard/conversations', icon: 'message' },
  { key: 'leads', label: 'Leads', href: '/dashboard/leads', icon: 'target' },
  { key: 'agent', label: 'My Agent', href: '/dashboard/agent', icon: 'robot' },
  { key: 'billing', label: 'Billing', href: '/dashboard/billing', icon: 'bar-chart' },
  { key: 'collective-brain', label: 'Collective Brain', href: '/dashboard/collective-brain', icon: 'sparkle' },
  { key: 'install', label: 'Install Widget', href: '/dashboard/install', icon: 'zap' },
]

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070d' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#07070d' }}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      {!isMobile && (
        <div className="w-60 flex flex-col" style={{ background: '#0d0d18', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <Icon name="robot" size={20} style={{ color: '#fff' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                NexAgent
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon name={item.icon as any} size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="mb-3">
              <div className="text-sm text-gray-400 truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <div 
          className="w-60 flex flex-col" 
          style={{ 
            background: '#0d0d18', 
            borderRight: '1px solid rgba(255,255,255,0.06)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000,
            height: '100vh'
          }}
        >
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <Icon name="robot" size={20} style={{ color: '#fff' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                NexAgent
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon name={item.icon as any} size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="mb-3">
              <div className="text-sm text-gray-400 truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b px-8 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-800 transition-all"
                  style={{ background: 'none', border: 'none', color: '#fff' }}
                >
                  <Icon name="menu" size={24} />
                </button>
              )}
              <h1 className="text-2xl font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                {navItems.find(item => item.key === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            
            {/* Right side actions can be added here */}
            <div className="flex items-center space-x-4">
              {/* Placeholder for notifications, etc. */}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
