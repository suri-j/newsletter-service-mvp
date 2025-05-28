'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserStats } from '@/lib/database.utils'
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  PaperAirplaneIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'

interface Stats {
  total_newsletters: number
  total_subscribers: number
  total_sends: number
  this_month_sends: number
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    total_newsletters: 0,
    total_subscribers: 0,
    total_sends: 0,
    this_month_sends: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { user, authLoading, userEmail: user?.email })
    
    // 디버그 모드 체크 (URL 파라미터로 활성화)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('debug') === 'true') {
      setDebugMode(true)
      setLoading(false)
      return
    }

    // 인증이 완료되고 사용자가 없으면 로그인 페이지로 리다이렉트
    if (!authLoading && !user) {
      console.log('No user found, redirecting to login')
      router.push('/login')
      return
    }

    if (user) {
      console.log('User found in dashboard:', user.email)
      loadStats()
    }
  }, [user, authLoading, router])

  const loadStats = async () => {
    if (!user) return
    
    try {
      setError(null)
      console.log('Loading stats for user:', user.id)
      const userStats = await getUserStats(user.id)
      console.log('Stats loaded:', userStats)
      setStats(userStats)
    } catch (error) {
      console.error('통계 로드 실패:', error)
      setError('통계를 불러오는데 실패했습니다.')
      // 에러 발생 시 기본값 유지
    } finally {
      setLoading(false)
    }
  }

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="font-semibold mb-2">디버깅 정보:</h4>
            <p className="text-sm">authLoading: {authLoading.toString()}</p>
            <p className="text-sm">user: {user ? user.email : 'null'}</p>
            <p className="text-sm">timestamp: {new Date().toISOString()}</p>
            <button
              onClick={() => window.location.href = '/dashboard?debug=true'}
              className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm"
            >
              디버그 모드로 대시보드 보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 사용자가 없으면 로그인 페이지로 리다이렉트 중
  if (!user && !debugMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 페이지로 이동 중...</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => router.push('/login')}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              수동으로 로그인 페이지 이동
            </button>
            <button
              onClick={() => window.location.href = '/dashboard?debug=true'}
              className="block w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              디버그 모드로 대시보드 보기
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="font-semibold mb-2">디버깅 정보:</h4>
            <p className="text-sm">authLoading: {authLoading.toString()}</p>
            <p className="text-sm">user: {user ? user.email : 'null'}</p>
            <p className="text-sm">debugMode: {debugMode.toString()}</p>
            <p className="text-sm">timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Debug Mode Banner */}
        {debugMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🔧 디버그 모드</h4>
            <p className="text-sm text-yellow-700 mb-2">
              인증 없이 대시보드를 표시하고 있습니다.
            </p>
            <div className="text-xs text-yellow-600">
              <p>authLoading: {authLoading.toString()}</p>
              <p>user: {user?.email || 'null'}</p>
              <p>debugMode: {debugMode.toString()}</p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              일반 모드로 돌아가기
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              대시보드
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              안녕하세요, {debugMode ? '디버그 사용자' : user?.email}님! 뉴스레터 서비스 현황을 한눈에 확인하세요.
            </p>
          </div>
          <Link
            href="/newsletters/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            새 뉴스레터
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadStats}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 뉴스레터
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.total_newsletters}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 구독자
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.total_subscribers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PaperAirplaneIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 발송
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.total_sends}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      이번 달 발송
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.this_month_sends}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              빠른 작업
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/newsletters/create"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <EnvelopeIcon className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">새 뉴스레터 작성</h4>
                  <p className="text-sm text-gray-500">새로운 뉴스레터를 작성하고 발송하세요</p>
                </div>
              </Link>

              <Link
                href="/subscribers"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">구독자 관리</h4>
                  <p className="text-sm text-gray-500">구독자를 추가하고 관리하세요</p>
                </div>
              </Link>

              <Link
                href="/newsletters"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">뉴스레터 관리</h4>
                  <p className="text-sm text-gray-500">기존 뉴스레터를 확인하고 관리하세요</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              최근 활동
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">활동 내역이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                뉴스레터를 작성하고 발송하면 여기에 활동 내역이 표시됩니다.
              </p>
              <div className="mt-6">
                <Link
                  href="/newsletters/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  첫 번째 뉴스레터 작성하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 