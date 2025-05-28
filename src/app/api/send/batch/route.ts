import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getResendClient, emailConfig } from '@/lib/resend';
import { renderNewsletterEmail, BatchEmailResult } from '@/lib/email-utils';
import { getNewsletterById, getAllSubscribers } from '@/lib/database.utils';
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

    const { newsletterId, subscriberIds, sendToAll = false } = await request.json();

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

    // 구독자 목록 조회
    let subscribers: Subscriber[] = [];
    
    if (sendToAll) {
      // 모든 활성 구독자에게 발송
      const allSubscribers = await getAllSubscribers(user.id);
      subscribers = allSubscribers.filter(s => s.is_active);
    } else {
      // 선택된 구독자들에게 발송
      if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
        return NextResponse.json(
          { error: '발송할 구독자를 선택해주세요.' },
          { status: 400 }
        );
      }

      const { data: selectedSubscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('id', subscriberIds);

      if (subscribersError) {
        return NextResponse.json(
          { error: '구독자 조회에 실패했습니다.' },
          { status: 500 }
        );
      }

      subscribers = selectedSubscribers || [];
    }

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: '발송할 활성 구독자가 없습니다.' },
        { status: 400 }
      );
    }

    const result: BatchEmailResult = {
      total: subscribers.length,
      successful: 0,
      failed: 0,
      results: []
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 배치 발송 (병렬 처리를 위해 Promise.allSettled 사용)
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        // HTML 이메일 생성
        const emailHtml = renderNewsletterEmail(newsletter, subscriber, baseUrl);

        // 이메일 발송
        const resend = getResendClient();
        const emailResult = await resend.emails.send({
          from: emailConfig.from,
          to: subscriber.email,
          subject: newsletter.title,
          html: emailHtml,
          replyTo: emailConfig.replyTo,
        });

        if (emailResult.error) {
          throw new Error(emailResult.error.message || '이메일 발송 실패');
        }

        // 발송 기록 저장
        const { error: sendRecordError } = await supabase
          .from('newsletter_sends')
          .insert({
            newsletter_id: newsletterId,
            subscriber_id: subscriber.id,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

        if (sendRecordError) {
          console.error('발송 기록 저장 실패:', sendRecordError);
          // 발송은 성공했으므로 계속 진행
        }

        return {
          subscriberId: subscriber.id,
          email: subscriber.email,
          success: true,
          messageId: emailResult.data?.id
        };

      } catch (error: any) {
        // 실패한 경우 발송 기록을 실패로 저장
        await supabase
          .from('newsletter_sends')
          .insert({
            newsletter_id: newsletterId,
            subscriber_id: subscriber.id,
            status: 'failed',
            error_message: error.message,
          });

        return {
          subscriberId: subscriber.id,
          email: subscriber.email,
          success: false,
          error: error.message
        };
      }
    });

    // 모든 이메일 발송 대기
    const emailResults = await Promise.allSettled(emailPromises);

    // 결과 집계
    emailResults.forEach((promiseResult) => {
      if (promiseResult.status === 'fulfilled') {
        const emailResult = promiseResult.value;
        result.results.push(emailResult);
        
        if (emailResult.success) {
          result.successful++;
        } else {
          result.failed++;
        }
      } else {
        result.failed++;
        result.results.push({
          subscriberId: 'unknown',
          email: 'unknown',
          success: false,
          error: promiseResult.reason?.message || '알 수 없는 오류'
        });
      }
    });

    return NextResponse.json({
      success: true,
      result,
      message: `총 ${result.total}개 중 ${result.successful}개 발송 성공, ${result.failed}개 실패`
    });

  } catch (error) {
    console.error('배치 이메일 발송 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 