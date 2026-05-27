'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, CalendarDays, Compass, Plus } from 'lucide-react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import type { PlannedPlan } from '@/types/plan'

interface Post {
  id: string
  authorId: string
  authorName: string
  title: string
  comment: string
  plan: PlannedPlan
  createdAt: number
}

const CARD_GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-rose-500',
  'from-pink-400 to-fuchsia-600',
  'from-amber-400 to-orange-500',
]

function gradientFor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length]
}

function calcDays(plan: PlannedPlan) {
  return plan.itinerary.length
}

function collectPlaces(plan: PlannedPlan) {
  const places: string[] = []
  for (const day of plan.itinerary) {
    for (const spot of day.spots) {
      if (spot.place && !spot.isFixed && !places.includes(spot.place)) {
        places.push(spot.place)
        if (places.length >= 4) return places
      }
    }
  }
  return places
}

function Avatar({ name }: { name: string }) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const color = colors[Math.abs(hash) % colors.length]
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}
    >
      {name.charAt(0)}
    </span>
  )
}

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    async function fetchPosts() {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post))
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const displayed = tab === 'mine' ? posts.filter((p) => p.authorId === user?.uid) : posts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-bold text-gray-900">旅行プランを探す</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/feed/new"
                className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                投稿する
              </Link>
            )}
            <Link href="/plans" className="text-sm text-gray-500 hover:text-gray-700">
              ホーム
            </Link>
          </div>
        </div>

        {/* タブ */}
        {user && (
          <div className="mx-auto max-w-2xl px-4 flex gap-0 border-t border-gray-100">
            {(['all', 'mine'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'all' ? 'すべて' : '自分の投稿'}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
                <div className="h-24 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Compass className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((post) => {
              const isOwn = user?.uid === post.authorId
              const days = calcDays(post.plan)
              const places = collectPlaces(post.plan)
              const gradient = gradientFor(post.title)

              return (
                <Link
                  key={post.id}
                  href={`/feed/${post.id}`}
                  className="block rounded-2xl bg-white shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {/* カラーバナー */}
                  <div className={`bg-gradient-to-r ${gradient} px-5 pt-5 pb-8 relative`}>
                    {isOwn && (
                      <span className="absolute top-3 right-3 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white">
                        自分の投稿
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-white leading-snug">{post.title}</h2>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs text-white font-medium">
                        {days}日間
                      </span>
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs text-white font-medium flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {post.plan.departureDate}〜
                      </span>
                    </div>
                  </div>

                  {/* カード本文 */}
                  <div className="-mt-4 mx-3 rounded-xl bg-white shadow-sm p-4">
                    {/* 行き先チップ */}
                    {places.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {places.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 font-medium"
                          >
                            <MapPin className="h-2.5 w-2.5" />
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    {post.comment && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.comment}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Avatar name={post.authorName} />
                      <span className="text-xs text-gray-500">{post.authorName}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
