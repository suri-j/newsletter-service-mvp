'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

export default function DateTimePicker({
  value,
  onChange,
  minDate = new Date(),
  placeholder = "날짜와 시간을 선택하세요",
  disabled = false
}: DateTimePickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
          disabled
        />
        <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="yyyy년 MM월 dd일 HH:mm"
        placeholderText={placeholder}
        minDate={minDate}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        wrapperClassName="w-full"
        calendarClassName="shadow-lg border rounded-lg"
        popperClassName="z-50"
        timeCaption="시간"
        locale="ko"
      />
      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  );
} 