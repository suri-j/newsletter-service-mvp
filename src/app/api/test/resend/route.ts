import { NextResponse } from 'next/server'
import { getResendClient } from '@/lib/resend'

export async function GET() {
  try {
    // 환경 변수 확인
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY 환경 변수가 설정되지 않았습니다.',
        details: {
          hasApiKey: false
        }
      }, { status: 400 })
    }
    
    try {
      // Resend 클라이언트 초기화 테스트
      const resend = getResendClient()
      
      // API 키 유효성 간접 확인 (실제 이메일 발송 없이)
      return NextResponse.json({
        success: true,
        message: 'Resend API 설정 확인 완료',
        details: {
          hasApiKey: true,
          apiKeyLength: resendApiKey.length,
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (resendError: any) {
      return NextResponse.json({
        success: false,
        error: 'Resend API 초기화 실패',
        details: resendError.message
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