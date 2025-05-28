import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { Metadata } from 'next';
import { getPreviewText } from '@/lib/email-utils';
import {
  CalendarIcon,
  UserIcon,
  ShareIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

type Newsletter = Database['public']['Tables']['newsletters']['Row'];

interface PublicNewsletterPageProps {
  params: {
    id: string;
  };
}

// 메타데이터 생성
export async function generateMetadata({ params }: PublicNewsletterPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', params.id)
    .eq('is_public', true)
    .single();

  if (!newsletter) {
    return {
      title: '뉴스레터를 찾을 수 없습니다',
    };
  }

  const previewText = getPreviewText(newsletter.content, 160);

  return {
    title: newsletter.title,
    description: previewText,
    openGraph: {
      title: newsletter.title,
      description: previewText,
      type: 'article',
      publishedTime: newsletter.published_at || newsletter.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: newsletter.title,
      description: previewText,
    },
  };
}

export default async function PublicNewsletterPage({ params }: PublicNewsletterPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // 공개된 뉴스레터만 조회
  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .eq('id', params.id)
    .eq('is_public', true)
    .single();

  if (error || !newsletter) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/public/${newsletter.id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">뉴스레터</span>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: newsletter.title,
                    url: shareUrl,
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  alert('링크가 복사되었습니다!');
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              공유하기
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Article Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {newsletter.title}
            </h1>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>{newsletter.users?.name || '작성자'}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {formatDate(newsletter.published_at || newsletter.created_at)}
                  </span>
                </div>
              </div>
              
              {newsletter.status === 'published' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  발행됨
                </span>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="px-6 py-8">
            <div 
              className="prose prose-lg max-w-none prose-blue prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: newsletter.content }}
            />
          </div>

          {/* Article Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                이 뉴스레터가 마음에 드셨나요?
              </div>
              <button
                onClick={() => {
                  // 구독 페이지로 이동하거나 구독 모달 열기
                  window.open('/subscribe', '_blank');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                구독하기
              </button>
            </div>
          </div>
        </article>

        {/* Related Content or CTA */}
        <div className="mt-8 bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            더 많은 뉴스레터 받아보기
          </h3>
          <p className="text-gray-600 mb-4">
            매주 새로운 인사이트와 정보를 담은 뉴스레터를 받아보세요.
          </p>
          <div className="flex space-x-4">
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              구독하기
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 뉴스레터 서비스. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 