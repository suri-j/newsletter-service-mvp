'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getNewsletterById, getAllSubscribers } from '@/lib/database.utils';
import { Database } from '@/lib/database.types';
import ScheduleModal from '@/components/schedule/ScheduleModal';
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

type Newsletter = Database['public']['Tables']['newsletters']['Row'];
type Subscriber = Database['public']['Tables']['subscribers']['Row'];

interface SendResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    subscriberId: string;
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export default function SendNewsletterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const newsletterId = params.id as string;

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (user && newsletterId) {
      loadData();
    }
  }, [user, newsletterId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [newsletterData, subscribersData] = await Promise.all([
        getNewsletterById(newsletterId),
        getAllSubscribers(user!.id)
      ]);

      if (!newsletterData || newsletterData.user_id !== user!.id) {
        router.push('/newsletters');
        return;
      }

      setNewsletter(newsletterData);
      const activeSubscribers = subscribersData.filter(s => s.is_active);
      setSubscribers(activeSubscribers);
      setSelectedSubscribers(activeSubscribers.map(s => s.id));
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriberToggle = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s.id));
    }
  };

  const handleTestSend = async () => {
    if (!testEmail || !newsletter) return;

    try {
      setSending(true);
      const response = await fetch('/api/send/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId: newsletter.id,
          testEmail
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('테스트 이메일이 발송되었습니다!');
        setTestEmail('');
      } else {
        alert('테스트 이메일 발송에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('테스트 발송 실패:', error);
      alert('테스트 발송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    if (!newsletter) return;

    const targetCount = sendToAll ? subscribers.length : selectedSubscribers.length;
    if (targetCount === 0) {
      alert('발송할 구독자를 선택해주세요.');
      return;
    }

    setShowConfirmModal(false);

    try {
      setSending(true);
      const response = await fetch('/api/send/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId: newsletter.id,
          subscriberIds: sendToAll ? undefined : selectedSubscribers,
          sendToAll
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSendResult(result.result);
      } else {
        alert('이메일 발송에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('발송 실패:', error);
      alert('발송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async (scheduledDate: Date) => {
    if (!newsletter) return;

    try {
      setScheduling(true);
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId: newsletter.id,
          scheduledAt: scheduledDate.toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('뉴스레터가 예약되었습니다!');
        router.push('/scheduled');
      } else {
        alert('예약 설정에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('예약 설정 실패:', error);
      alert('예약 설정 중 오류가 발생했습니다.');
    } finally {
      setScheduling(false);
      setShowScheduleModal(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">뉴스레터를 찾을 수 없습니다</h3>
      </div>
    );
  }

  if (sendResult) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">발송 완료</h1>
          <p className="mt-2 text-gray-600">
            총 {sendResult.total}개 중 {sendResult.successful}개 발송 성공, {sendResult.failed}개 실패
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-2xl font-bold text-blue-600">{sendResult.total}</div>
              <div className="text-sm text-gray-500">총 발송</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{sendResult.successful}</div>
              <div className="text-sm text-gray-500">성공</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{sendResult.failed}</div>
              <div className="text-sm text-gray-500">실패</div>
            </div>
          </div>

          {sendResult.failed > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">실패 목록</h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        이메일
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        오류
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sendResult.results.filter(r => !r.success).map((result, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{result.email}</td>
                        <td className="px-4 py-2 text-sm text-red-600">{result.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push('/newsletters')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              뉴스레터 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">뉴스레터 발송</h1>
        <p className="mt-1 text-sm text-gray-600">
          &ldquo;{newsletter.title}&rdquo; 뉴스레터를 구독자들에게 발송합니다.
        </p>
      </div>

      {/* 뉴스레터 미리보기 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">뉴스레터 미리보기</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-xl font-semibold mb-2">{newsletter.title}</h4>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: newsletter.content }}
          />
        </div>
      </div>

      {/* 테스트 발송 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">테스트 발송</h3>
        <div className="flex space-x-4">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="테스트 이메일 주소"
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleTestSend}
            disabled={!testEmail || sending}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '발송 중...' : '테스트 발송'}
          </button>
        </div>
      </div>

      {/* 발송 대상 선택 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">발송 대상 선택</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
                className="mr-2"
              />
              모든 활성 구독자 ({subscribers.length}명)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
                className="mr-2"
              />
              선택한 구독자만
            </label>
          </div>

          {!sendToAll && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-700">
                  구독자 목록 ({selectedSubscribers.length}/{subscribers.length} 선택됨)
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedSubscribers.length === subscribers.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {subscribers.map(subscriber => (
                  <label key={subscriber.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onChange={() => handleSubscriberToggle(subscriber.id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {subscriber.name || '이름 없음'}
                      </div>
                      <div className="text-sm text-gray-500">{subscriber.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 발송 버튼 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">발송 준비 완료</h3>
            <p className="text-sm text-gray-600">
              {sendToAll 
                ? `${subscribers.length}명의 구독자에게 발송됩니다.`
                : `${selectedSubscribers.length}명의 선택된 구독자에게 발송됩니다.`
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={sending || scheduling || (sendToAll ? subscribers.length === 0 : selectedSubscribers.length === 0)}
              className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              예약 발송
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={sending || scheduling || (sendToAll ? subscribers.length === 0 : selectedSubscribers.length === 0)}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  즉시 발송
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 예약 발송 모달 */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
        newsletterTitle={newsletter.title}
        loading={scheduling}
      />

      {/* 발송 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  뉴스레터 발송 확인
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    &ldquo;{newsletter.title}&rdquo; 뉴스레터를{' '}
                    {sendToAll 
                      ? `${subscribers.length}명의 모든 구독자`
                      : `${selectedSubscribers.length}명의 선택된 구독자`
                    }에게 발송하시겠습니까?
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    발송 후에는 취소할 수 없습니다.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    발송하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 