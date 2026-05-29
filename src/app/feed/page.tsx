'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, CalendarDays, Compass, Plus, Search, X, Heart, Bookmark } from 'lucide-react'
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore'
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
  likeCount?: number
  likedBy?: string[]
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
  const [tab, setTab] = useState<'all' | 'following' | 'bookmarks' | 'mine'>('all')
  const [search, setSearch] = useState('')
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setFollowedIds(new Set())
        setBookmarkedIds(new Set())
        return
      }
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data()
      setFollowedIds(new Set(data?.following ?? []))
      setBookmarkedIds(new Set(data?.bookmarks ?? []))
    }
    fetchUserData()
  }, [user])

  useEffect(() => {
    async function fetchPosts() {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post))
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const tabFiltered =
    tab === 'mine'
      ? posts.filter((p) => p.authorId === user?.uid)
      : tab === 'following'
        ? posts.filter((p) => followedIds.has(p.authorId))
        : tab === 'bookmarks'
          ? posts.filter((p) => bookmarkedIds.has(p.id))
          : posts

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tabFiltered
    return tabFiltered.filter((p) => {
      const places = collectPlaces(p.plan).join(' ')
      return (
        p.title.toLowerCase().includes(q) ||
        p.comment.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        places.toLowerCase().includes(q)
      )
    })
  }, [tabFiltered, search])

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
            {(
              [
                { key: 'all', label: 'すべて' },
                { key: 'following', label: 'フォロー中' },
                { key: 'bookmarks', label: 'ブックマーク' },
                { key: 'mine', label: '自分の投稿' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {key === 'bookmarks' && <Bookmark className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>
        )}

        {/* 検索バー */}
        <div className="mx-auto max-w-2xl px-4 pb-3 pt-2 border-t border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="タイトル・行き先・投稿者で検索"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-9 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
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
            <p className="text-sm">
              {search ? '該当する投稿が見つかりません' : 'まだ投稿がありません'}
            </p>
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={post.authorName} />
                        <span className="text-xs text-gray-500">{post.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-400">
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-medium">{post.likeCount ?? 0}</span>
                      </div>
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
