'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Login() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showEmailAuth, setShowEmailAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // 환경 변수가 설정되어 있는지 확인
  const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                           process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'

  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      try {
        // 환경 변수가 없으면 오프라인 모드
        if (!hasSupabaseConfig) {
          setIsOfflineMode(true)
          setLoading(false)
          setErrorMessage('Supabase 설정이 필요합니다. 데모 모드로 진행하거나 환경 변수를 설정해주세요.')
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('세션 확인 오류:', error)
          setErrorMessage('연결 오류가 발생했습니다. 환경 변수를 확인해주세요.')
          setIsOfflineMode(true)
        } else if (session?.user) {
          setUser(session.user)
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error)
        if (mounted) {
          setErrorMessage('서비스 연결에 문제가 있습니다. 데모 모드를 사용해주세요.')
          setIsOfflineMode(true)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // 타임아웃으로 무한 로딩 방지
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false)
        setErrorMessage('로딩 시간이 초과되었습니다. 데모 모드를 사용해주세요.')
        setIsOfflineMode(true)
      }
    }, 5000) // 5초 타임아웃

    checkAuth()

    if (hasSupabaseConfig) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          
          if (session?.user) {
            setUser(session.user)
            router.push('/dashboard')
          } else {
            setUser(null)
          }
        }
      )

      return () => {
        mounted = false
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    } else {
      return () => {
        mounted = false
        clearTimeout(timeout)
      }
    }
  }, [router, hasSupabaseConfig])

  const handleDemoLogin = () => {
    // 데모 모드로 대시보드에 접근
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo-user-123',
      email: 'demo@example.com',
      user_metadata: { full_name: 'Demo User' }
    }))
    router.push('/dashboard')
  }

  const handleGoogleSignIn = async () => {
    if (!hasSupabaseConfig) {
      setErrorMessage('Supabase 설정이 필요합니다.')
      return
    }

    try {
      setIsSigningIn(true)
      setErrorMessage('')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      console.error('Google 로그인 오류:', error)
      setIsSigningIn(false)
      
      if (error.message?.includes('provider is not enabled') || 
          error.message?.includes('Unsupported provider')) {
        setErrorMessage('Google 로그인이 설정되지 않았습니다. 이메일 로그인을 사용해주세요.')
        setShowEmailAuth(true)
      } else {
        setErrorMessage(`로그인 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`)
      }
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasSupabaseConfig) {
      setErrorMessage('Supabase 설정이 필요합니다.')
      return
    }

    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsSigningIn(true)
      setErrorMessage('')
      
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })
        if (error) throw error
        setErrorMessage('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
      }
    } catch (error: any) {
      console.error('이메일 인증 오류:', error)
      setErrorMessage(error.message || '인증 중 오류가 발생했습니다.')
    } finally {
      setIsSigningIn(false)
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
          <button
            onClick={() => {
              setLoading(false)
              setIsOfflineMode(true)
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-500 underline"
          >
            로딩 건너뛰기 (데모 모드)
          </button>
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
        {errorMessage && (
          <div className={`p-4 rounded-lg border ${
            errorMessage.includes('완료') 
              ? 'bg-green-50 border-green-200 text-green-800'
              : isOfflineMode 
                ? 'bg-orange-50 border-orange-200 text-orange-800'
                : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm">{errorMessage}</p>
            {errorMessage.includes('Google 로그인이 설정되지') && (
              <button
                onClick={() => setShowEmailAuth(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500 underline"
              >
                이메일 로그인 사용하기
              </button>
            )}
          </div>
        )}

        {/* 오프라인/데모 모드일 때 */}
        {isOfflineMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
              🎯 데모 모드로 체험하기
            </h3>
            <p className="text-sm text-blue-700 mb-4 text-center">
              실제 데이터베이스 없이 UI와 기능을 체험할 수 있습니다
            </p>
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              데모 모드로 시작하기
            </button>
          </div>
        )}

        {/* 실제 로그인 폼 */}
        {!isOfflineMode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              {!showEmailAuth ? (
                /* Google 로그인 */
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    로그인하여 시작하기
                  </h3>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningIn ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
                    ) : (
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                    )}
                    {isSigningIn ? '로그인 중...' : 'Google로 로그인'}
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
                    onClick={() => setShowEmailAuth(true)}
                    className="w-full mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
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
                      disabled={isSigningIn}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningIn ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {isSigningIn ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
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
        {isOfflineMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚙️ 실제 환경 설정</h4>
            <p className="text-sm text-yellow-700 mb-2">
              실제 기능을 사용하려면 .env.local 파일에 다음을 추가하세요:
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
      </div>
    </div>
  )
} 