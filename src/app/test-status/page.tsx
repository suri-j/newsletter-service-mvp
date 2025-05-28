'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface ConnectionStatus {
  supabase: boolean
  resend: boolean
  google: boolean
}

export default function TestStatusPage() {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: false,
    resend: false,
    google: false
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    testConnections()
  }, [])

  const testConnections = async () => {
    const newErrors: string[] = []
    const newStatus: ConnectionStatus = {
      supabase: false,
      resend: false,
      google: false
    }

    // Supabase 연결 테스트
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()
      
      if (!error) {
        newStatus.supabase = true
      } else {
        newErrors.push(`Supabase 연결 실패: ${error.message}`)
      }
    } catch (error: any) {
      newErrors.push(`Supabase 연결 오류: ${error.message}`)
    }

    // 환경 변수 확인
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingVars = requiredEnvVars.filter(varName => {
      const value = process.env[varName]
      return !value || value === 'your_supabase_url_here' || value === 'your_supabase_key_here'
    })

    if (missingVars.length > 0) {
      newErrors.push(`누락된 환경 변수: ${missingVars.join(', ')}`)
    }

    // Resend 테스트 (선택사항)
    try {
      const response = await fetch('/api/test/resend')
      if (response.ok) {
        newStatus.resend = true
      } else {
        const errorData = await response.json()
        newErrors.push(`Resend 연결 실패: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      newErrors.push(`Resend 테스트 오류: ${error.message}`)
    }

    // Google OAuth 테스트 (선택사항)
    try {
      const response = await fetch('/api/test/google')
      if (response.ok) {
        newStatus.google = true
      } else {
        const errorData = await response.json()
        newErrors.push(`Google OAuth 설정 확인 필요: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      newErrors.push(`Google OAuth 테스트 오류: ${error.message}`)
    }

    setStatus(newStatus)
    setErrors(newErrors)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">연결 상태 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">시스템 상태 확인</h1>
          <p className="mt-2 text-gray-600">
            뉴스레터 서비스의 연결 상태를 확인합니다
          </p>
        </div>

        {/* 전체 상태 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">전체 상태</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              Object.values(status).every(s => s)
                ? 'bg-green-100 text-green-800'
                : Object.values(status).some(s => s)
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {Object.values(status).every(s => s)
                ? '모든 서비스 정상'
                : Object.values(status).some(s => s)
                ? '일부 서비스 이용 가능'
                : '서비스 설정 필요'
              }
            </div>
          </div>
        </div>

        {/* 개별 서비스 상태 */}
        <div className="space-y-4">
          {/* Supabase */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Supabase (필수)</h3>
                <p className="text-sm text-gray-500">데이터베이스 및 인증</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status.supabase
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {status.supabase ? '연결됨' : '연결 실패'}
              </div>
            </div>
          </div>

          {/* Resend */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Resend (선택사항)</h3>
                <p className="text-sm text-gray-500">이메일 발송 서비스</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status.resend
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.resend ? '연결됨' : '설정 필요'}
              </div>
            </div>
          </div>

          {/* Google OAuth */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Google OAuth (선택사항)</h3>
                <p className="text-sm text-gray-500">Google 로그인</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status.google
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.google ? '설정됨' : '설정 필요'}
              </div>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {errors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-4">발견된 문제</h3>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {error}
                </li>
              ))}
            </ul>
            <div className="mt-4 p-4 bg-red-100 rounded-md">
              <p className="text-sm text-red-800">
                환경 변수 값이 올바른지 확인하세요.
              </p>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">설정 도움말</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Supabase 설정:</strong> .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하세요.
            </p>
            <p>
              <strong>Resend 설정:</strong> .env.local 파일에 RESEND_API_KEY를 추가하세요.
            </p>
            <p>
              <strong>Google OAuth:</strong> Supabase 대시보드에서 Google 프로바이더를 활성화하세요.
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={testConnections}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            다시 확인
          </button>
          <a
            href="/login"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            로그인 페이지로
          </a>
        </div>
      </div>
    </div>
  )
} 