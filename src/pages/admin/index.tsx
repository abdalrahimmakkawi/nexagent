import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/admin'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady) return
    
    const checkAuth = async () => {
      try {
        console.log('🔍 [ADMIN DEBUG] Starting authentication check...')
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('🚨 [ADMIN ERROR] Session error:', sessionError.message)
          setError('Session error: ' + sessionError.message)
          setTimeout(() => router.push('/login'), 3000)
          return
        }
        
        if (!session) {
          console.error('🚨 [ADMIN ERROR] No session found')
          setError('No session found')
          setTimeout(() => router.push('/login'), 3000)
          return
        }
        
        const userEmail = session.user.email
        const isAdmin = userEmail === ADMIN_EMAIL
        
        console.log('🔍 [ADMIN DEBUG] User email:', userEmail)
        console.log('🔍 [ADMIN DEBUG] Is admin:', isAdmin)
        
        if (!isAdmin) {
          console.error('🚨 [ADMIN ERROR] Not authorized')
          setError('Access denied')
          setTimeout(() => router.push('/login'), 3000)
          return
        }
        
        console.log('✅ [ADMIN DEBUG] User authorized')
        setUser(session.user)
        setIsAuthorized(true)
        setLoading(false)
        
      } catch (err) {
        console.error('🚨 [ADMIN ERROR] Auth check failed:', err)
        setError('Authentication failed')
        setTimeout(() => router.push('/login'), 3000)
      }
    }
    
    checkAuth()
  }, [router.isReady])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">🔍 Admin Authentication</p>
          <p className="text-sm text-gray-500">Checking access...</p>
          {error && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">🚨 Access Denied</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - NexAgent</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
            <p className="text-gray-600">Admin functionality is working. Environment variables are loading properly.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900">Authentication</h3>
                <p className="text-blue-700">✅ Working</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900">Admin Access</h3>
                <p className="text-green-700">✅ Authorized</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900">Environment</h3>
                <p className="text-purple-700">✅ Loading</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
