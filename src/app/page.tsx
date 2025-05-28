'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로그인된 사용자는 대시보드로 리다이렉트
    if (user && !loading) {
      window.location.replace('/dashboard')
    }
  }, [user, loading])

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인된 사용자는 리다이렉트 중 메시지 표시
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📨 Newsletter Service
          </h1>
          <p className="text-xl text-gray-600">
            주식 및 경제 뉴스 뉴스레터 서비스
          </p>
        </div>

        {/* 로그인 안내 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 서비스 시작하기</h2>
          <p className="mb-6 text-blue-100">
            구글 계정으로 간편하게 로그인하고 뉴스레터 서비스를 이용해보세요
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            🔐 Google로 로그인하기
          </Link>
        </div>

        {/* 주요 기능 소개 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            ✨ 주요 기능
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-3">✍️</div>
              <h4 className="font-semibold text-gray-800 mb-2">직관적인 에디터</h4>
              <p className="text-sm text-gray-600">Rich Text Editor로 쉽게 뉴스레터 작성</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">👥</div>
              <h4 className="font-semibold text-gray-800 mb-2">구독자 관리</h4>
              <p className="text-sm text-gray-600">CSV 업로드로 대량 구독자 등록</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">📧</div>
              <h4 className="font-semibold text-gray-800 mb-2">이메일 발송</h4>
              <p className="text-sm text-gray-600">즉시 발송 및 예약 발송 지원</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">🌐</div>
              <h4 className="font-semibold text-gray-800 mb-2">공개 페이지</h4>
              <p className="text-sm text-gray-600">SEO 최적화된 뉴스레터 공개 링크</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-800 mb-2">실시간 통계</h4>
              <p className="text-sm text-gray-600">발송 현황 및 구독자 통계</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">⏰</div>
              <h4 className="font-semibold text-gray-800 mb-2">예약 발송</h4>
              <p className="text-sm text-gray-600">원하는 시간에 자동 발송</p>
            </div>
          </div>
        </div>

        {/* 실제 기능 테스트 가이드 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            🧪 실제 기능 테스트 가이드
          </h3>
          <p className="text-green-700 mb-4">
            환경 변수가 설정되었습니다! 이제 모든 기능을 실제로 테스트해볼 수 있습니다.
          </p>
          
          <div className="space-y-3 text-sm text-green-700">
            <div className="flex items-start space-x-3">
              <span className="font-semibold text-green-800">1️⃣</span>
              <div>
                <strong>로그인 테스트:</strong> 위의 &ldquo;Google로 로그인하기&rdquo; 버튼을 클릭하여 실제 Google OAuth 로그인을 테스트해보세요.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="font-semibold text-green-800">2️⃣</span>
              <div>
                <strong>뉴스레터 작성:</strong> 로그인 후 사이드바에서 &ldquo;뉴스레터 작성&rdquo;을 클릭하여 Rich Text Editor를 테스트해보세요.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="font-semibold text-green-800">3️⃣</span>
              <div>
                <strong>구독자 관리:</strong> CSV 파일 업로드 및 구독자 추가/편집 기능을 테스트해보세요.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="font-semibold text-green-800">4️⃣</span>
              <div>
                <strong>이메일 발송:</strong> 테스트 이메일 발송 및 실제 구독자에게 발송 기능을 테스트해보세요.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="font-semibold text-green-800">5️⃣</span>
              <div>
                <strong>공개 페이지:</strong> 뉴스레터를 공개로 설정하고 SEO 최적화된 공개 링크를 확인해보세요.
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>💡 팁:</strong> 모든 기능이 실제 데이터베이스와 연동되어 작동합니다. 
              테스트용 데이터를 생성해도 괜찮으니 자유롭게 모든 기능을 테스트해보세요!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 