import Link from 'next/link'
import { MapPin, PlusCircle, BookOpen, Send, Users, LogIn } from 'lucide-react'

const menuItems = [
  {
    href: '/plans/new',
    icon: PlusCircle,
    label: '旅行プランを作成',
    description: '新しい旅の計画をたてよう',
    color: 'bg-blue-500 hover:bg-blue-600',
    enabled: true,
  },
  {
    href: '/plans/my',
    icon: BookOpen,
    label: 'マイプランを確認',
    description: '作成済みの旅行プランを見る',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    enabled: true,
  },
  {
    href: '/feed/new',
    icon: Send,
    label: 'プランを投稿する',
    description: '旅行プランをみんなとシェア',
    color: 'bg-violet-500 hover:bg-violet-600',
    enabled: false,
  },
  {
    href: '/feed',
    icon: Users,
    label: 'みんなの投稿を見る',
    description: '他のユーザーの旅行プランを閲覧',
    color: 'bg-orange-500 hover:bg-orange-600',
    enabled: false,
  },
]

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-800">TravelPlanner</span>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            ログイン
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">マイページ</h1>
          <p className="mt-2 text-gray-500">旅行の計画・記録・シェアができます</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            if (item.enabled) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${item.color} flex items-center gap-4 rounded-2xl p-6 text-white shadow-md transition-transform hover:-translate-y-1`}
                >
                  <Icon className="h-10 w-10 flex-shrink-0" />
                  <div>
                    <p className="text-lg font-bold">{item.label}</p>
                    <p className="mt-0.5 text-sm opacity-80">{item.description}</p>
                  </div>
                </Link>
              )
            }
            return (
              <div
                key={item.href}
                className="flex items-center gap-4 rounded-2xl bg-gray-200 p-6 text-gray-400 shadow-inner cursor-not-allowed"
              >
                <Icon className="h-10 w-10 flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold">{item.label}</p>
                  <p className="mt-0.5 text-sm">近日公開予定</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
