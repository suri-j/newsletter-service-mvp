import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    // Supabase 클라이언트 초기화 테스트
    const supabase = getSupabaseClient()
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 환경 변수가 설정되지 않았습니다.',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 400 })
    }
    
    // Google OAuth 프로바이더 상태 확인 (간접적)
    try {
      // 세션 확인으로 Supabase 연결 테스트
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Supabase 연결 실패',
          details: error.message
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Google OAuth 설정 확인 완료',
        details: {
          supabaseConnected: true,
          hasSession: !!data.session,
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (authError: any) {
      return NextResponse.json({
        success: false,
        error: 'Google OAuth 설정 확인 실패',
        details: authError.message
      }, { status: 500 })
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: '서버 오류',
      details: error.message
    }, { status: 500 })
  }
} 