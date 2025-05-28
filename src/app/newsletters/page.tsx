'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { newsletterOperations } from '@/lib/database.utils'
import { Database } from '@/lib/database.types'
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
  LinkIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

type Newsletter = Database['public']['Tables']['newsletters']['Row']

export default function NewslettersPage() {
  const { user } = useAuth()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadNewsletters()
    }
  }, [user])

  const loadNewsletters = async () => {
    try {
      setLoading(true)
      const data = await newsletterOperations.getAll(user!.id)
      setNewsletters(data)
    } catch (error) {
      console.error('뉴스레터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 뉴스레터를 삭제하시겠습니까?')) {
      return
    }

    try {
      await newsletterOperations.delete(id)
      setNewsletters(newsletters.filter(n => n.id !== id))
      alert('뉴스레터가 삭제되었습니다.')
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleTogglePublic = async (id: string, currentPublicStatus: boolean) => {
    try {
      setToggling(id)
      const response = await fetch(`/api/newsletters/${id}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentPublicStatus })
      })

      const result = await response.json()
      
      if (result.success) {
        // 로컬 상태 업데이트
        setNewsletters(prev => prev.map(newsletter => 
          newsletter.id === id 
            ? { ...newsletter, is_public: !currentPublicStatus }
            : newsletter
        ))
        
        if (result.publicUrl) {
          alert(`뉴스레터가 공개되었습니다!\n공개 URL: ${result.publicUrl}`)
        } else {
          alert('뉴스레터가 비공개로 변경되었습니다.')
        }
      } else {
        alert('공개 상태 변경에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('공개 상태 변경 실패:', error)
      alert('공개 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setToggling(null)
    }
  }

  const copyPublicUrl = (id: string) => {
    const url = `${window.location.origin}/public/${id}`
    navigator.clipboard.writeText(url)
    alert('공개 URL이 복사되었습니다!')
  }

  const getStatusBadge = (newsletter: Newsletter) => {
    const badges = []
    
    // 기본 상태 배지
    switch (newsletter.status) {
      case 'published':
        badges.push(
          <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            발행됨
          </span>
        )
        break
      case 'scheduled':
        badges.push(
          <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            예약됨
          </span>
        )
        break
      default:
        badges.push(
          <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            임시저장
          </span>
        )
    }

    // 공개 상태 배지
    if (newsletter.is_public) {
      badges.push(
        <span key="public" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <GlobeAltIcon className="w-3 h-3 mr-1" />
          공개
        </span>
      )
    }

    return <div className="flex items-center gap-2">{badges}</div>
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">뉴스레터 관리</h1>
            <p className="text-gray-600 mt-2">작성한 뉴스레터를 관리하고 편집하세요</p>
          </div>
          
          <Link
            href="/create"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            새 뉴스레터 작성
          </Link>
        </div>

        {/* Newsletter List */}
        {newsletters.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성한 뉴스레터가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 뉴스레터를 작성해보세요!</p>
            <Link
              href="/create"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              새 뉴스레터 작성
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {newsletters.map((newsletter) => (
              <div key={newsletter.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {newsletter.title}
                        </h3>
                        {getStatusBadge(newsletter)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {new Date(newsletter.created_at).toLocaleDateString('ko-KR')}
                        </div>
                        {newsletter.published_at && (
                          <div>
                            발행일: {new Date(newsletter.published_at).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                        {newsletter.scheduled_at && (
                          <div>
                            예약일: {new Date(newsletter.scheduled_at).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                      </div>

                      {/* 공개 URL 표시 */}
                      {newsletter.is_public && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-blue-600">공개 URL:</span>
                          <button
                            onClick={() => copyPublicUrl(newsletter.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            /public/{newsletter.id}
                          </button>
                        </div>
                      )}

                      {/* Content Preview */}
                      <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: newsletter.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                          }} 
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* 공개/비공개 토글 */}
                      <button
                        onClick={() => handleTogglePublic(newsletter.id, newsletter.is_public)}
                        disabled={toggling === newsletter.id}
                        className={`p-2 transition-colors ${
                          newsletter.is_public 
                            ? 'text-blue-600 hover:text-blue-800' 
                            : 'text-gray-400 hover:text-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={newsletter.is_public ? '공개 중 (클릭하여 비공개)' : '비공개 (클릭하여 공개)'}
                      >
                        {toggling === newsletter.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : newsletter.is_public ? (
                          <GlobeAltIcon className="w-4 h-4" />
                        ) : (
                          <EyeSlashIcon className="w-4 h-4" />
                        )}
                      </button>

                      <Link
                        href={`/newsletters/${newsletter.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="편집"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      
                      <Link
                        href={`/newsletters/${newsletter.id}/preview`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="미리보기"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/send/${newsletter.id}`}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="발송"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(newsletter.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
} 