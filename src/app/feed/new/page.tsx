'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Send, ChevronLeft } from 'lucide-react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { getPlans } from '@/lib/storage'
import type { Plan } from '@/types/plan'

export default function FeedNewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [plans] = useState<Plan[]>(() => getPlans())
  const [selectedId, setSelectedId] = useState<string>('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login')
    }
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !user) return
    const plan = plans.find((p) => p.id === selectedId)
    if (!plan) return

    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: user.displayName ?? '名無し',
        title: plan.title,
        comment,
        plan,
        createdAt: Date.now(),
      })
      router.push('/feed')
    } catch {
      setError('投稿に失敗しました。もう一度お試しください')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <Link href="/plans" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <MapPin className="h-5 w-5 text-blue-500" />
          <span className="text-lg font-bold text-gray-800">プランを投稿する</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                投稿するプランを選択
              </label>
              {plans.length === 0 ? (
                <p className="text-sm text-gray-400">
                  保存済みのプランがありません。先に
                  <Link href="/plans/new" className="text-blue-500 underline mx-1">
                    プランを作成
                  </Link>
                  してください。
                </p>
              ) : (
                <select
                  required
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">選択してください</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}（{p.departureDate} 〜 {p.returnDate}）
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コメント（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="旅の感想やおすすめポイントを書いてみよう"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !selectedId}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-500 py-2.5 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
              {loading ? '投稿中...' : '投稿する'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
