'use client'

import Link from 'next/link'
import { MapPin, PlusCircle, BookOpen, Send, Users, LogIn, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const menuItems = [
  {
    href: '/plans/new',
    icon: PlusCircle,
    label: '旅行プランを作成',
    description: '新しい旅の計画をたてよう',
    color: 'bg-blue-500 hover:bg-blue-600',
    enabled: true,
    requireAuth: false,
  },
  {
    href: '/plans/my',
    icon: BookOpen,
    label: 'マイプランを確認',
    description: '作成済みの旅行プランを見る',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    enabled: true,
    requireAuth: false,
  },
  {
    href: '/feed/new',
    icon: Send,
    label: 'プランを投稿する',
    description: '旅行プランをみんなとシェア',
    color: 'bg-violet-500 hover:bg-violet-600',
    enabled: true,
    requireAuth: true,
  },
  {
    href: '/feed',
    icon: Users,
    label: 'みんなの投稿を見る',
    description: '他のユーザーの旅行プランを閲覧',
    color: 'bg-orange-500 hover:bg-orange-600',
    enabled: true,
    requireAuth: false,
  },
  {
    href: '/events',
    icon: Sparkles,
    label: '今月・来月のイベント',
    description: '祭り・花火・花など開催中のイベントを確認',
    color: 'bg-rose-500 hover:bg-rose-600',
    enabled: true,
    requireAuth: false,
  },
]

export default function PlansPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-800">TravelPlanner</span>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.displayName ?? user.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              ログイン
            </Link>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">たびノート</h1>
          <p className="mt-2 text-gray-500">旅行の計画・記録・シェアができます</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isLocked = item.requireAuth && !user
            if (item.enabled && !isLocked) {
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
              <Link
                key={item.href}
                href="/auth/login"
                className="flex items-center gap-4 rounded-2xl bg-gray-200 p-6 text-gray-400 shadow-inner hover:bg-gray-300 transition-colors"
              >
                <Icon className="h-10 w-10 flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold">{item.label}</p>
                  <p className="mt-0.5 text-sm">ログインが必要です</p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
