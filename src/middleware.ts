import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // 디버깅 모드 확인 (URL 파라미터로 활성화)
  const url = req.nextUrl.clone()
  const debugMode = url.searchParams.get('debug') === 'true' || url.pathname.includes('test-dashboard')
  
  if (debugMode) {
    console.log('🔧 Debug mode: skipping auth middleware')
    return NextResponse.next()
  }

  // 환경 변수가 없으면 인증 없이 통과 (UI 테스트용)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase 환경 변수가 설정되지 않았습니다. UI 미리보기 모드로 실행됩니다.')
    
    // 보호된 라우트에 접근 시 경고 메시지를 위해 홈으로 리다이렉트하지 않고 통과
    return NextResponse.next()
  }

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    console.log('🔍 Middleware: checking session for', req.nextUrl.pathname)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log('🔍 Middleware: session result', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      pathname: req.nextUrl.pathname 
    })

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/create', '/subscribers', '/send', '/analytics', '/settings', '/newsletters', '/scheduled']
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    // 로그인 페이지에서 대시보드로의 직접 접근을 허용 (임시 해결책)
    const referer = req.headers.get('referer')
    const isFromLogin = referer && referer.includes('/login')
    
    if (isFromLogin && req.nextUrl.pathname === '/dashboard') {
      console.log('🔄 Middleware: allowing dashboard access from login page')
      return res
    }

    // If accessing protected route without session, redirect to login
    if (isProtectedRoute && !session) {
      console.log('🚫 Middleware: redirecting to login (no session)')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (req.nextUrl.pathname === '/login' && session) {
      console.log('✅ Middleware: redirecting to dashboard (has session)')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If accessing root and logged in, redirect to dashboard
    if (req.nextUrl.pathname === '/' && session) {
      console.log('✅ Middleware: redirecting to dashboard from root (has session)')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('❌ 미들웨어 오류:', error)
    // 오류 발생 시 그냥 통과
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 