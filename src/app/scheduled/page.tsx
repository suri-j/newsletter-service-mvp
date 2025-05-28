'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllNewsletters } from '@/lib/database.utils';
import { Database } from '@/lib/database.types';
import {
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type Newsletter = Database['public']['Tables']['newsletters']['Row'];

export default function ScheduledPage() {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadScheduledNewsletters();
    }
  }, [user]);

  const loadScheduledNewsletters = async () => {
    try {
      setLoading(true);
      const allNewsletters = await getAllNewsletters(user!.id);
      const scheduledNewsletters = allNewsletters.filter(n => n.status === 'scheduled');
      setNewsletters(scheduledNewsletters);
    } catch (error) {
      console.error('예약된 뉴스레터 로딩 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (newsletterId: string) => {
    try {
      setCancelingId(newsletterId);
      const response = await fetch(`/api/schedule?newsletterId=${newsletterId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        alert('예약이 취소되었습니다.');
        loadScheduledNewsletters();
      } else {
        alert('예약 취소에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('예약 취소 실패:', error);
      alert('예약 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelingId(null);
      setShowCancelModal(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
  };

  const getTimeUntilSend = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff <= 0) return '곧 발송됩니다';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간 후`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분 후`;
    } else {
      return `${minutes}분 후`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">예약된 발송</h1>
        <p className="mt-1 text-sm text-gray-600">
          예약된 뉴스레터 발송 목록을 확인하고 관리하세요.
        </p>
      </div>

      {/* 예약된 뉴스레터 목록 */}
      {newsletters.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">예약된 발송이 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            뉴스레터를 작성하고 예약 발송을 설정해보세요.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              예약된 뉴스레터 ({newsletters.length}개)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {newsletters.map((newsletter) => (
              <div key={newsletter.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {newsletter.title}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDate(newsletter.scheduled_at!)}
                          </div>
                          <div className="text-blue-600 font-medium">
                            {getTimeUntilSend(newsletter.scheduled_at!)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div 
                        className="text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: newsletter.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="ml-6 flex-shrink-0">
                    <button
                      onClick={() => setShowCancelModal(newsletter.id)}
                      disabled={cancelingId === newsletter.id}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelingId === newsletter.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          취소 중...
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          예약 취소
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예약 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  예약 취소 확인
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    정말로 이 뉴스레터의 예약 발송을 취소하시겠습니까?
                    취소하면 임시저장 상태로 돌아갑니다.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowCancelModal(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    돌아가기
                  </button>
                  <button
                    onClick={() => handleCancelSchedule(showCancelModal)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    예약 취소
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