'use client';

import { useState } from 'react';
import { XMarkIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import DateTimePicker from './DateTimePicker';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledDate: Date) => void;
  newsletterTitle: string;
  loading?: boolean;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  newsletterTitle,
  loading = false
}: ScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = () => {
    if (!scheduledDate) {
      setError('발송 날짜와 시간을 선택해주세요.');
      return;
    }

    const now = new Date();
    if (scheduledDate <= now) {
      setError('현재 시간보다 늦은 시간을 선택해주세요.');
      return;
    }

    // 최소 5분 후 발송 가능
    const minTime = new Date(now.getTime() + 5 * 60 * 1000);
    if (scheduledDate < minTime) {
      setError('최소 5분 후 시간을 선택해주세요.');
      return;
    }

    setError(null);
    onSchedule(scheduledDate);
  };

  const handleClose = () => {
    setScheduledDate(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">예약 발송 설정</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              뉴스레터
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-900 font-medium">{newsletterTitle}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              발송 예정 시간
            </label>
            <DateTimePicker
              value={scheduledDate}
              onChange={setScheduledDate}
              placeholder="발송 날짜와 시간을 선택하세요"
              disabled={loading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">주의사항</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>최소 5분 후 시간을 선택해야 합니다.</li>
                  <li>예약 후 취소하려면 예약 목록에서 취소하세요.</li>
                  <li>서버 시간을 기준으로 발송됩니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading || !scheduledDate}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                설정 중...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-2" />
                예약 설정
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 