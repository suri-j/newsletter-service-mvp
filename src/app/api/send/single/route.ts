import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getResendClient, emailConfig } from '@/lib/resend';
import { renderNewsletterEmail } from '@/lib/email-utils';
import { getNewsletterById } from '@/lib/database.utils';
import { Database } from '@/lib/database.types';

type Subscriber = Database['public']['Tables']['subscribers']['Row'];

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

    const { newsletterId, subscriberId, testEmail } = await request.json();

    if (!newsletterId) {
      return NextResponse.json(
        { error: '뉴스레터 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 뉴스레터 조회
    const newsletter = await getNewsletterById(newsletterId);
    if (!newsletter || newsletter.user_id !== user.id) {
      return NextResponse.json(
        { error: '뉴스레터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    let subscriber: Subscriber;
    let recipientEmail: string;

    if (testEmail) {
      // 테스트 이메일 발송
      subscriber = {
        id: 'test',
        user_id: user.id,
        email: testEmail,
        name: '테스트 사용자',
        is_active: true,
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null
      };
      recipientEmail = testEmail;
    } else {
      // 실제 구독자에게 발송
      if (!subscriberId) {
        return NextResponse.json(
          { error: '구독자 ID가 필요합니다.' },
          { status: 400 }
        );
      }

      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('id', subscriberId)
        .eq('user_id', user.id)
        .single();

      if (subscriberError || !subscriberData) {
        return NextResponse.json(
          { error: '구독자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      subscriber = subscriberData;
      recipientEmail = subscriber.email;
    }

    // HTML 이메일 생성
    const emailHtml = renderNewsletterEmail(
      newsletter,
      subscriber,
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    );

    // 이메일 발송
    const resend = getResendClient();
    const emailResult = await resend.emails.send({
      from: emailConfig.from,
      to: recipientEmail,
      subject: newsletter.title,
      html: emailHtml,
      replyTo: emailConfig.replyTo,
    });

    if (emailResult.error) {
      console.error('이메일 발송 실패:', emailResult.error);
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 실제 발송인 경우 발송 기록 저장
    if (!testEmail && subscriberId) {
      const { error: sendRecordError } = await supabase
        .from('newsletter_sends')
        .insert({
          newsletter_id: newsletterId,
          subscriber_id: subscriberId,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

      if (sendRecordError) {
        console.error('발송 기록 저장 실패:', sendRecordError);
        // 발송은 성공했으므로 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.data?.id,
      message: testEmail ? '테스트 이메일이 발송되었습니다.' : '이메일이 발송되었습니다.'
    });

  } catch (error) {
    console.error('이메일 발송 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 