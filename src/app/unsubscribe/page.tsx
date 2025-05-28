'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { parseUnsubscribeToken } from '@/lib/email-utils';
import { Database } from '@/lib/database.types';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (token) {
      handleUnsubscribe();
    } else {
      setError('유효하지 않은 구독 취소 링크입니다.');
      setLoading(false);
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      // 토큰에서 구독자 ID 추출
      const subscriberId = parseUnsubscribeToken(token);
      if (!subscriberId) {
        setError('유효하지 않은 토큰입니다.');
        return;
      }

      // 구독자 조회
      const { data: subscriber, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('id', subscriberId)
        .single();

      if (fetchError || !subscriber) {
        setError('구독자 정보를 찾을 수 없습니다.');
        return;
      }

      if (!subscriber.is_active) {
        setEmail(subscriber.email);
        setSuccess(true);
        return;
      }

      // 구독 취소 처리
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('id', subscriberId);

      if (updateError) {
        setError('구독 취소 처리 중 오류가 발생했습니다.');
        return;
      }

      setEmail(subscriber.email);
      setSuccess(true);

    } catch (error) {
      console.error('구독 취소 오류:', error);
      setError('구독 취소 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                구독 취소 처리 중...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">뉴스레터</h1>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {success ? (
              <>
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400" />
                <h2 className="mt-4 text-xl font-medium text-gray-900">
                  구독이 취소되었습니다
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {email}의 뉴스레터 구독이 성공적으로 취소되었습니다.
                </p>
                <p className="mt-4 text-xs text-gray-500">
                  더 이상 이메일을 받지 않으실 것입니다.
                  언제든지 다시 구독하실 수 있습니다.
                </p>
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400" />
                <h2 className="mt-4 text-xl font-medium text-gray-900">
                  구독 취소 실패
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {error}
                </p>
                <p className="mt-4 text-xs text-gray-500">
                  문제가 지속되면 고객지원팀에 문의해주세요.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 