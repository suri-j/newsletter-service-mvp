'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface Status {
  supabaseUrl: string
  supabaseKey: string
  connection: string
  error: string | null
}

export default function TestStatus() {
  const [status, setStatus] = useState<Status>({
    supabaseUrl: '',
    supabaseKey: '',
    connection: 'testing...',
    error: null
  })

  useEffect(() => {
    const checkStatus = async () => {
      // 환경 변수 확인
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not set'
      
      setStatus(prev => ({
        ...prev,
        supabaseUrl: url,
        supabaseKey: key.startsWith('eyJ') ? `${key.substring(0, 20)}...` : key
      }))

      // 연결 테스트
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(prev => ({
            ...prev,
            connection: 'Failed',
            error: error.message
          }))
        } else {
          setStatus(prev => ({
            ...prev,
            connection: 'Success',
            error: null
          }))
        }
      } catch (err: any) {
        setStatus(prev => ({
          ...prev,
          connection: 'Failed',
          error: err.message
        }))
      }
    }

    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">시스템 상태 확인</h1>
          
          <div className="space-y-6">
            {/* 환경 변수 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">환경 변수</h2>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                  <span className={`text-sm ${
                    status.supabaseUrl === 'Not set' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {status.supabaseUrl}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <span className={`text-sm ${
                    status.supabaseKey === 'Not set' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {status.supabaseKey}
                  </span>
                </div>
              </div>
            </div>

            {/* 연결 상태 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Supabase 연결</h2>
              <div className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium">연결 상태:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status.connection === 'Success' 
                      ? 'bg-green-100 text-green-800'
                      : status.connection === 'Failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status.connection}
                  </span>
                </div>
                {status.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <strong>오류:</strong> {status.error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 권장 사항 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">권장 사항</h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                {status.supabaseUrl === 'Not set' || status.supabaseKey === 'Not set' ? (
                  <div>
                    <p className="text-blue-800 mb-2">환경 변수가 설정되지 않았습니다.</p>
                    <p className="text-sm text-blue-700">
                      프로젝트 루트에 <code className="bg-blue-100 px-1 rounded">.env.local</code> 파일을 생성하고 
                      Supabase 설정을 추가하세요.
                    </p>
                  </div>
                ) : status.connection === 'Failed' ? (
                  <div>
                    <p className="text-blue-800 mb-2">연결에 실패했습니다.</p>
                    <p className="text-sm text-blue-700">
                      환경 변수 값이 올바른지 확인하거나 데모 모드를 사용하세요.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-blue-800 mb-2">✅ 모든 설정이 정상입니다!</p>
                    <p className="text-sm text-blue-700">
                      실제 로그인 기능을 사용할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-4">
              <a
                href="/login"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                로그인 페이지로
              </a>
              <a
                href="/"
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors text-center"
              >
                홈으로
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 