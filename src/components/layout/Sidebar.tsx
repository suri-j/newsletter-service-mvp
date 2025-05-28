'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { 
  HomeIcon, 
  PencilSquareIcon,
  DocumentDuplicateIcon,
  UsersIcon, 
  PaperAirplaneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: HomeIcon },
  { name: '뉴스레터 작성', href: '/create', icon: PencilSquareIcon },
  { name: '뉴스레터 관리', href: '/newsletters', icon: DocumentDuplicateIcon },
  { name: '구독자 관리', href: '/subscribers', icon: UsersIcon },
  { name: '발송 관리', href: '/send', icon: PaperAirplaneIcon },
  { name: '예약된 발송', href: '/scheduled', icon: CalendarIcon },
  { name: '통계', href: '/analytics', icon: ChartBarIcon },
  { name: '설정', href: '/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [demoUser, setDemoUser] = useState(null)

  useEffect(() => {
    // 데모 사용자 확인
    if (typeof window !== 'undefined') {
      const demo = localStorage.getItem('demo_user')
      if (demo) {
        setDemoUser(JSON.parse(demo))
      }
    }
  }, [])

  const currentUser = demoUser || user

  const handleSignOut = async () => {
    try {
      // 데모 모드인 경우 localStorage에서 제거
      if (demoUser) {
        localStorage.removeItem('demo_user')
        router.push('/login')
        return
      }
      
      // 실제 사용자인 경우 Supabase 로그아웃
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          📨 Newsletter {demoUser && <span className="text-sm text-blue-600">(데모)</span>}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <item.icon 
                className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} 
                aria-hidden="true" 
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {currentUser?.user_metadata?.avatar_url ? (
                <img 
                  src={currentUser.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {demoUser ? 'D' : currentUser?.user_metadata?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {demoUser 
                  ? 'Demo User' 
                  : currentUser?.user_metadata?.name || '사용자'
                }
              </p>
              <p className="text-xs text-gray-500 truncate">
                {demoUser 
                  ? 'demo@example.com' 
                  : currentUser?.email || 'user@example.com'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={demoUser ? '데모 종료' : '로그아웃'}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 