'use client'

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 라우팅 성공!</h1>
        <p className="text-gray-600 mb-4">
          이 페이지가 보인다면 Next.js 라우팅은 정상적으로 작동하고 있습니다.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            실제 대시보드로 이동
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
} 