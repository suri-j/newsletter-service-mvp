'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { createManySubscribers } from '@/lib/database.utils';
import { Database } from '@/lib/database.types';
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface CSVUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

interface CSVRow {
  email: string;
  name?: string;
}

interface ParsedData {
  valid: CSVRow[];
  invalid: { row: number; data: any; error: string }[];
}

export default function CSVUpload({ isOpen, onClose, onSuccess, userId }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    duplicates: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      alert('CSV 파일만 업로드 가능합니다.');
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid: CSVRow[] = [];
        const invalid: { row: number; data: any; error: string }[] = [];

        results.data.forEach((row: any, index: number) => {
          if (!row.email || typeof row.email !== 'string') {
            invalid.push({
              row: index + 1,
              data: row,
              error: '이메일 주소가 필요합니다.'
            });
            return;
          }

          const email = row.email.trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
          if (!emailRegex.test(email)) {
            invalid.push({
              row: index + 1,
              data: row,
              error: '유효하지 않은 이메일 형식입니다.'
            });
            return;
          }

          valid.push({
            email,
            name: row.name?.trim() || null
          });
        });

        setParsedData({ valid, invalid });
        setStep('preview');
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('CSV 파일을 읽는 중 오류가 발생했습니다.');
      }
    });
  };

  const handleUpload = async () => {
    if (!parsedData || !userId) return;

    setUploading(true);
    try {
      const subscribersToInsert: Database['public']['Tables']['subscribers']['Insert'][] = 
        parsedData.valid.map(row => ({
          user_id: userId,
          email: row.email,
          name: row.name,
          is_active: true,
          subscribed_at: new Date().toISOString()
        }));

      await createManySubscribers(subscribersToInsert);
      
      setUploadResult({
        success: parsedData.valid.length,
        failed: parsedData.invalid.length,
        duplicates: 0
      });
      
      setStep('result');
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Handle duplicate key errors
      if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        alert('일부 이메일 주소가 이미 존재합니다.');
      } else {
        alert('업로드 중 오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setParsedData(null);
    setStep('upload');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            CSV 파일로 구독자 일괄 추가
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              <p className="mb-2">CSV 파일 형식 안내:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>첫 번째 열: <strong>email</strong> (필수)</li>
                <li>두 번째 열: <strong>name</strong> (선택사항)</li>
                <li>첫 번째 행은 헤더로 사용됩니다</li>
              </ul>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      CSV 파일을 선택하거나 드래그하여 업로드
                    </span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    파일 선택
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    CSV 파일 예시
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <pre className="text-xs bg-white p-2 rounded border">
{`email,name
john@example.com,John Doe
jane@example.com,Jane Smith
user@domain.com,`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && parsedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">미리보기</h4>
              <div className="text-sm text-gray-600">
                총 {parsedData.valid.length + parsedData.invalid.length}개 행
              </div>
            </div>

            {parsedData.valid.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-2">
                  ✓ 유효한 데이터 ({parsedData.valid.length}개)
                </h5>
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          이메일
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          이름
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.valid.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.valid.length > 10 && (
                    <div className="p-2 text-center text-sm text-gray-500">
                      ... 및 {parsedData.valid.length - 10}개 더
                    </div>
                  )}
                </div>
              </div>
            )}

            {parsedData.invalid.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-red-800 mb-2">
                  ✗ 오류 데이터 ({parsedData.invalid.length}개)
                </h5>
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-500 uppercase">
                          행
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-500 uppercase">
                          데이터
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-500 uppercase">
                          오류
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.invalid.map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.row}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {JSON.stringify(row.data)}
                          </td>
                          <td className="px-4 py-2 text-sm text-red-600">{row.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                다시 선택
              </button>
              <button
                onClick={handleUpload}
                disabled={parsedData.valid.length === 0 || uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '업로드 중...' : `${parsedData.valid.length}개 구독자 추가`}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && uploadResult && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
              <h4 className="mt-2 text-lg font-medium text-gray-900">업로드 완료</h4>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <dl className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <dt className="text-sm font-medium text-gray-500">성공</dt>
                  <dd className="text-2xl font-bold text-green-600">{uploadResult.success}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">실패</dt>
                  <dd className="text-2xl font-bold text-red-600">{uploadResult.failed}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">중복</dt>
                  <dd className="text-2xl font-bold text-yellow-600">{uploadResult.duplicates}</dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 