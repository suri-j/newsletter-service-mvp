import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { isPublic } = await request.json();
    const newsletterId = params.id;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: '유효하지 않은 공개 상태입니다.' },
        { status: 400 }
      );
    }

    // 뉴스레터 소유권 확인
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .eq('user_id', user.id)
      .single();

    if (newsletterError || !newsletter) {
      return NextResponse.json(
        { error: '뉴스레터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 공개 상태 업데이트
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        is_public: isPublic,
        published_at: isPublic && !newsletter.published_at ? new Date().toISOString() : newsletter.published_at
      })
      .eq('id', newsletterId);

    if (updateError) {
      return NextResponse.json(
        { error: '공개 상태 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    const publicUrl = isPublic 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/public/${newsletterId}`
      : null;

    return NextResponse.json({
      success: true,
      message: isPublic ? '뉴스레터가 공개되었습니다.' : '뉴스레터가 비공개로 변경되었습니다.',
      isPublic,
      publicUrl
    });

  } catch (error) {
    console.error('공개 상태 변경 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 