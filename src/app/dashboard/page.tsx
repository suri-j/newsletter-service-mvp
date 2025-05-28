'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { statsOperations } from '@/lib/database.utils'

interface Stats {
  total_newsletters: number
  total_subscribers: number
  total_sends: number
  this_month_sends: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    total_newsletters: 0,
    total_subscribers: 0,
    total_sends: 0,
    this_month_sends: 0
  })
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // 데모 사용자 확인
  const demoUser = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('demo_user') || 'null')
    : null

  useEffect(() => {
    if (demoUser) {
      setIsDemoMode(true)
      // 데모 데이터 설정
      setStats({
        total_newsletters: 5,
        total_subscribers: 142,
        total_sends: 28,
        this_month_sends: 12
      })
      setLoading(false)
    } else if (user) {
      loadStats()
    }
  }, [user, demoUser])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await statsOperations.getUserStats(user!.id)
      setStats(data)
    } catch (error) {
      console.error('통계 로딩 오류:', error)
      // 실제 DB 연결 실패 시 데모 데이터 표시
      setStats({
        total_newsletters: 0,
        total_subscribers: 0,
        total_sends: 0,
        this_month_sends: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* 데모 모드 표시 */}
        {isDemoMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-800 font-medium">데모 모드</span>
              <span className="text-blue-700 ml-2">- 모든 기능을 체험할 수 있습니다</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            대시보드 {isDemoMode && '(데모)'}
          </h1>
          <p className="text-gray-600 mt-2">뉴스레터 서비스 현황을 한눈에 확인하세요</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">총 뉴스레터</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_newsletters}</p>
              </div>
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">총 구독자</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_subscribers}</p>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">총 발송</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_sends}</p>
              </div>
              <div className="text-purple-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">이번 달 발송</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.this_month_sends}</p>
              </div>
              <div className="text-orange-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
            <div className="space-y-3">
              <a
                href="/create"
                className="flex items-center p-3 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                새 뉴스레터 작성
              </a>
              <a
                href="/subscribers"
                className="flex items-center p-3 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                구독자 추가
              </a>
              <a
                href="/newsletters"
                className="flex items-center p-3 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                뉴스레터 관리
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isDemoMode ? '데모 기능 안내' : '최근 활동'}
            </h2>
            {isDemoMode ? (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>✍️ Rich Text Editor로 뉴스레터 작성</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>👥 구독자 관리 및 CSV 업로드</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>📧 이메일 발송 시뮬레이션</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>⏰ 예약 발송 설정</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>🌐 공개 페이지 미리보기</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">아직 활동이 없습니다.</p>
                <p className="text-sm text-gray-400 mt-1">첫 번째 뉴스레터를 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>

        {/* 데모 모드 안내 */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">🎉 데모 모드에서 모든 기능을 체험해보세요!</h3>
            <p className="text-blue-100 mb-4">
              실제 이메일은 발송되지 않지만, 모든 UI와 기능을 정상적으로 테스트할 수 있습니다.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  localStorage.removeItem('demo_user')
                  window.location.href = '/login'
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md text-sm transition-colors"
              >
                실제 계정으로 전환
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 