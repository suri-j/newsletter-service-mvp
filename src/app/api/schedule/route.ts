import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function POST(request: NextRequest) {
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

    const { newsletterId, scheduledAt } = await request.json();

    if (!newsletterId || !scheduledAt) {
      return NextResponse.json(
        { error: '뉴스레터 ID와 예약 시간이 필요합니다.' },
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

    // 예약 시간 검증
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const minTime = new Date(now.getTime() + 5 * 60 * 1000); // 5분 후

    if (scheduledDate <= minTime) {
      return NextResponse.json(
        { error: '최소 5분 후 시간을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 뉴스레터 예약 상태로 업데이트
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        scheduled_at: scheduledAt,
        status: 'scheduled'
      })
      .eq('id', newsletterId);

    if (updateError) {
      return NextResponse.json(
        { error: '예약 설정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터가 예약되었습니다.',
      scheduledAt
    });

  } catch (error) {
    console.error('예약 설정 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('newsletterId');

    if (!newsletterId) {
      return NextResponse.json(
        { error: '뉴스레터 ID가 필요합니다.' },
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

    if (newsletter.status !== 'scheduled') {
      return NextResponse.json(
        { error: '예약된 뉴스레터가 아닙니다.' },
        { status: 400 }
      );
    }

    // 예약 취소 - 임시저장 상태로 변경
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        scheduled_at: null,
        status: 'draft'
      })
      .eq('id', newsletterId);

    if (updateError) {
      return NextResponse.json(
        { error: '예약 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터 예약이 취소되었습니다.'
    });

  } catch (error) {
    console.error('예약 취소 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 