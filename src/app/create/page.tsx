'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { useAuth } from '@/hooks/useAuth'
import { newsletterOperations } from '@/lib/database.utils'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ClockIcon,
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline'

export default function CreateNewsletter() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!user || !title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      
      const newsletter = await newsletterOperations.create({
        user_id: user.id,
        title: title.trim(),
        content: content || '',
        status,
        is_published: status === 'published',
        published_at: status === 'published' ? new Date().toISOString() : null
      })

      alert(`뉴스레터가 ${status === 'draft' ? '임시저장' : '발행'}되었습니다.`)
      router.push('/dashboard')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">새 뉴스레터 작성</h1>
            <p className="text-gray-600 mt-2">독자들에게 전달할 뉴스레터를 작성해보세요</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {showPreview ? '편집 모드' : '미리보기'}
            </button>
            
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              임시저장
            </button>
            
            <button
              onClick={() => handleSave('published')}
              disabled={loading || !title.trim()}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              발행하기
            </button>
          </div>
        </div>

        {showPreview ? (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                미리보기
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {title || '제목을 입력해주세요'}
              </h1>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="p-6">
              {content ? (
                <div 
                  className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              ) : (
                <p className="text-gray-500">내용을 입력해주세요</p>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="뉴스레터 제목을 입력하세요"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="독자들에게 전달하고 싶은 내용을 작성해주세요..."
              />
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">💡 작성 팁</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 명확하고 흥미로운 제목을 작성하세요</li>
                <li>• 독자가 쉽게 읽을 수 있도록 문단을 나누어 작성하세요</li>
                <li>• 중요한 내용은 굵게 표시하거나 목록으로 정리하세요</li>
                <li>• 관련 링크나 출처를 포함하여 신뢰성을 높이세요</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 