'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { getAllSubscribers, createSubscriber, deleteSubscriber, updateSubscriber } from '@/lib/database.utils';
import { Database } from '@/lib/database.types';
import CSVUpload from '@/components/subscribers/CSVUpload';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

type Subscriber = Database['public']['Tables']['subscribers']['Row'];

interface SubscriberWithStats extends Subscriber {
  open_count?: number;
  click_count?: number;
}

export default function SubscribersPage() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<SubscriberWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  
  const itemsPerPage = 10;

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (user) {
      loadSubscribers();
    }
  }, [user, currentPage, searchTerm]);

  const loadSubscribers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const allSubscribers = await getAllSubscribers(user.id);
      
      // Filter by search term
      const filteredSubscribers = allSubscribers.filter((subscriber: any) =>
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);
      
      setSubscribers(paginatedSubscribers);
      setTotalPages(Math.ceil(filteredSubscribers.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!user || !newEmail) return;

    try {
      await createSubscriber({
        user_id: user.id,
        email: newEmail.trim(),
        name: newName.trim() || null,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      });
      
      setNewEmail('');
      setNewName('');
      setShowAddModal(false);
      await loadSubscribers();
    } catch (error) {
      console.error('Error adding subscriber:', error);
      alert('구독자 추가 중 오류가 발생했습니다.');
    }
  };

  const handleEditSubscriber = async () => {
    if (!selectedSubscriber) return;

    try {
      await updateSubscriber(selectedSubscriber.id, {
        email: newEmail.trim(),
        name: newName.trim() || null,
      });
      
      setShowEditModal(false);
      setSelectedSubscriber(null);
      setNewEmail('');
      setNewName('');
      await loadSubscribers();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      alert('구독자 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('정말로 이 구독자를 삭제하시겠습니까?')) return;

    try {
      await deleteSubscriber(subscriberId);
      await loadSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('구독자 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleStatusToggle = async (subscriber: Subscriber) => {
    try {
      const newIsActive = !subscriber.is_active;
      const updates: any = { is_active: newIsActive };
      
      if (!newIsActive) {
        updates.unsubscribed_at = new Date().toISOString();
      } else {
        updates.unsubscribed_at = null;
      }
      
      await updateSubscriber(subscriber.id, updates);
      await loadSubscribers();
    } catch (error) {
      console.error('Error updating subscriber status:', error);
      alert('구독자 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const openEditModal = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setNewEmail(subscriber.email);
    setNewName(subscriber.name || '');
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">구독자 관리</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">구독자 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            뉴스레터 구독자를 관리하고 새로운 구독자를 추가하세요.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            CSV 업로드
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            구독자 추가
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 구독자
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {subscribers.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-600"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    활성 구독자
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {subscribers.filter(s => s.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-red-600"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    구독 취소
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {subscribers.filter(s => !s.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="이메일 또는 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            구독자 목록
          </h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구독자 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구독일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.name || '이름 없음'}
                      </div>
                      <div className="text-sm text-gray-500">{subscriber.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(subscriber)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {subscriber.is_active ? '활성' : '구독취소'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(subscriber)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {subscribers.length === 0 && !loading && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">구독자가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                첫 번째 구독자를 추가하여 시작하세요.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  구독자 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                {' - '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, subscribers.length)}
                </span>
                {' / '}
                <span className="font-medium">{subscribers.length}</span>
                개 결과
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && user && (
        <CSVUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            loadSubscribers();
            setShowUploadModal(false);
          }}
          userId={user.id}
        />
      )}

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                새 구독자 추가
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일 주소 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="subscriber@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    이름 (선택사항)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="구독자 이름"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewEmail('');
                    setNewName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  onClick={handleAddSubscriber}
                  disabled={!newEmail.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscriber Modal */}
      {showEditModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                구독자 정보 수정
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                    이메일 주소 *
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                    이름 (선택사항)
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSubscriber(null);
                    setNewEmail('');
                    setNewName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSubscriber}
                  disabled={!newEmail.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 