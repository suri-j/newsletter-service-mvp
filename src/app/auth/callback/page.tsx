'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // 디버깅 정보 수집
        const currentUrl = window.location.href
        const code = searchParams.get('code')
        const error_code = searchParams.get('error')
        const error_description = searchParams.get('error_description')
        
        const debugData = {
          currentUrl,
          hasCode: !!code,
          codeLength: code?.length || 0,
          error_code,
          error_description,
          timestamp: new Date().toISOString()
        }
        
        setDebugInfo(JSON.stringify(debugData, null, 2))
        console.log('Auth callback debug info:', debugData)
        
        if (error_code) {
          console.error('OAuth error:', error_code, error_description)
          setError(`OAuth 오류: ${error_description || error_code}`)
          setStatus('error')
          return
        }

        // 현재 세션 먼저 확인
        console.log('Checking current session...')
        const { data: currentSession, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setError(`세션 확인 오류: ${sessionError.message}`)
          setStatus('error')
          return
        }

        if (currentSession.session && currentSession.session.user) {
          console.log('Found existing session, redirecting to dashboard')
          setStatus('success')
          
          // 즉시 리다이렉트
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 500)
          return
        }

        if (code) {
          console.log('Processing OAuth code...')
          // 코드를 세션으로 교환
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Code exchange error:', error)
            setError(`인증 처리 오류: ${error.message}`)
            setStatus('error')
            return
          }

          if (data.session && data.user) {
            console.log('Authentication successful:', data.user.email)
            setStatus('success')
            
            // 세션 설정 후 잠시 대기 후 리다이렉트
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
            return
          }
        }

        // 모든 경우에 실패한 경우
        console.log('No valid session or code found')
        setError('인증에 실패했습니다. 다시 로그인해주세요.')
        setStatus('error')
        
      } catch (err: any) {
        console.error('Unexpected error in auth callback:', err)
        setError(`예상치 못한 오류: ${err.message || '알 수 없는 오류가 발생했습니다.'}`)
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  // 에러 발생 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        window.location.href = '/login'
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 처리 중...</h2>
          <p className="text-gray-600 mb-4">Google 인증을 완료하고 있습니다.</p>
          
          {/* 디버깅 정보 표시 */}
          {debugInfo && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">디버깅 정보 보기</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 성공!</h2>
          <p className="text-gray-600 mb-4">대시보드로 이동 중...</p>
          <button
            onClick={() => {
              window.location.href = '/dashboard'
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 실패</h2>
        <p className="text-gray-600 mb-4 text-sm">{error}</p>
        <p className="text-sm text-gray-500 mb-4">5초 후 로그인 페이지로 이동합니다...</p>
        
        {/* 디버깅 정보 표시 */}
        {debugInfo && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">디버깅 정보 보기</summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {debugInfo}
            </pre>
          </details>
        )}
        
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          지금 로그인 페이지로 이동
        </button>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 