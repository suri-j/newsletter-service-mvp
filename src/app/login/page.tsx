'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const router = useRouter()
  const { user, session, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [showEmailAuth, setShowEmailAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 환경 변수가 설정되어 있는지 확인
  const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                           process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'

  useEffect(() => {
    // 디버깅 정보 업데이트
    const debugData = {
      loading,
      hasUser: !!user,
      userEmail: user?.email,
      hasSession: !!session,
      sessionAccessToken: !!session?.access_token,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(JSON.stringify(debugData, null, 2))
    console.log('Login page debug:', debugData)

    // 로그인된 사용자만 대시보드로 리다이렉트 (로딩 완료 후, 유효한 세션 확인)
    if (!loading && user && session && session.access_token) {
      console.log('Valid user session found, redirecting to dashboard:', user.email)
      router.push('/dashboard')
    }
  }, [user, session, loading, router])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = getSupabaseClient()
      
      // 현재 URL 정보 수집
      const currentUrl = window.location.href
      const baseUrl = window.location.origin
      const redirectUrl = `${baseUrl}/auth/callback`
      
      console.log('Initiating Google login with redirect:', redirectUrl)
      
      // 명시적으로 redirect URL 설정
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Google OAuth error:', error)
        setError(`Google 로그인 오류: ${error.message}`)
        setIsLoading(false)
        return
      }
      
      console.log('OAuth initiated successfully:', data)
      
      // OAuth 리다이렉트가 시작되면 로딩 상태 유지
      // 실제로는 페이지가 Google로 리다이렉트됨
      
    } catch (err: any) {
      console.error('Unexpected error during Google login:', err)
      setError(`예상치 못한 오류: ${err.message || '알 수 없는 오류가 발생했습니다.'}`)
      setIsLoading(false)
    }
  }

  // 대체 방법: 직접 Google OAuth URL 생성
  const handleDirectGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 직접 Google OAuth URL 구성
      const baseUrl = window.location.origin
      const redirectUrl = `${baseUrl}/auth/callback`
      
      // Supabase의 OAuth URL 직접 생성
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const googleOAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
      
      console.log('Direct Google OAuth URL:', googleOAuthUrl)
      
      // 직접 리다이렉트
      window.location.href = googleOAuthUrl
      
    } catch (err: any) {
      console.error('Direct Google login error:', err)
      setError(`직접 로그인 오류: ${err.message}`)
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasSupabaseConfig) {
      setError('Supabase 설정이 필요합니다.')
      return
    }

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      if (isSignUp) {
        const { data, error } = await getSupabaseClient().auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        setError('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.')
      } else {
        const { data, error } = await getSupabaseClient().auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
      }
    } catch (error: any) {
      console.error('이메일 인증 오류:', error)
      setError(error.message || '인증 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 인증 로딩 중일 때만 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">인증 상태 확인 중...</p>
            
            {/* 디버깅 정보 */}
            {debugInfo && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">디버깅 정보</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <pre>{debugInfo}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 이미 로그인된 사용자 (유효한 세션 확인)
  if (user && session && session.access_token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-4">대시보드로 이동 중...</p>
            <p className="text-sm text-gray-500 mb-4">로그인된 사용자: {user.email}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                수동으로 대시보드 이동
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const supabase = getSupabaseClient()
                    await supabase.auth.signOut()
                    window.location.reload() // 페이지 새로고침으로 상태 초기화
                  } catch (error) {
                    console.error('Logout error:', error)
                  }
                }}
                className="block w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                로그아웃 후 다시 로그인
              </button>
            </div>
            
            {/* 디버깅 정보 */}
            {debugInfo && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">디버깅 정보</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <pre>{debugInfo}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📨</h1>
          <h2 className="text-3xl font-bold text-gray-900">Newsletter Service</h2>
          <p className="mt-4 text-lg text-gray-600">
            주식 및 경제 뉴스 뉴스레터 서비스에 오신 것을 환영합니다
          </p>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">로그인 오류</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 로그인 폼 */}
        {hasSupabaseConfig && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              {!showEmailAuth ? (
                /* Google 로그인 */
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    로그인하여 시작하기
                  </h3>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        로그인 중...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google로 로그인
                      </div>
                    )}
                  </button>

                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">또는</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDirectGoogleLogin}
                    disabled={isLoading}
                    className="w-full mt-4 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    직접 Google 로그인 (대체 방법)
                  </button>

                  <button
                    onClick={() => setShowEmailAuth(true)}
                    className="w-full mt-2 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    이메일로 로그인
                  </button>
                </div>
              ) : (
                /* 이메일 로그인 폼 */
                <form onSubmit={handleEmailAuth}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    {isSignUp ? '회원가입' : '이메일 로그인'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        이메일
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        비밀번호
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="비밀번호를 입력하세요"
                        minLength={6}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {isLoading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowEmailAuth(false)}
                      className="text-sm text-gray-600 hover:text-gray-500"
                    >
                      ← Google 로그인으로 돌아가기
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 환경 변수 설정 안내 */}
        {!hasSupabaseConfig && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚙️ 환경 설정 필요</h4>
            <p className="text-sm text-yellow-700 mb-2">
              서비스를 사용하려면 .env.local 파일에 다음을 추가하세요:
            </p>
            <pre className="text-xs bg-yellow-100 p-2 rounded overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key`}
            </pre>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>
            계속 진행하면{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              서비스 약관
            </a>
            {' '}및{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              개인정보 처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← 홈페이지로 돌아가기
          </button>
        </div>

        {/* 디버깅 정보 */}
        {debugInfo && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              디버깅 정보 보기
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-md">
              <pre className="text-xs text-gray-700 overflow-auto whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  )
} 