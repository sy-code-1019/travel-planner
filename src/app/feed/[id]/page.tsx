'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
  Home,
  Heart,
  UserPlus,
  UserCheck,
  Bookmark,
  BookmarkCheck,
  Copy,
} from 'lucide-react'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { savePlan } from '@/lib/storage'
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

function Avatar({ name }: { name: string }) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const color = colors[Math.abs(hash) % colors.length]
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${color} text-sm font-bold text-white`}
    >
      {name.charAt(0)}
    </span>
  )
}

export default function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      const snap = await getDoc(doc(db, 'posts', id))
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Post
        setPost(data)
        setEditComment(data.comment)
        setLikeCount(data.likeCount ?? 0)
      }
      setLoading(false)
    }
    fetchPost()
  }, [id])

  useEffect(() => {
    if (!post || !user) return
    async function fetchStatus() {
      setLiked((post!.likedBy ?? []).includes(user!.uid))
      const snap = await getDoc(doc(db, 'users', user!.uid))
      const data = snap.data()
      const following: string[] = data?.following ?? []
      const bookmarks: string[] = data?.bookmarks ?? []
      if (post!.authorId !== user!.uid) {
        setFollowed(following.includes(post!.authorId))
      }
      setBookmarked(bookmarks.includes(post!.id))
    }
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, user?.uid])

  async function handleLike() {
    if (!user || likeLoading) return
    setLikeLoading(true)
    const postRef = doc(db, 'posts', id)
    if (liked) {
      await updateDoc(postRef, { likedBy: arrayRemove(user.uid), likeCount: increment(-1) })
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await updateDoc(postRef, { likedBy: arrayUnion(user.uid), likeCount: increment(1) })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
    setLikeLoading(false)
  }

  async function handleBookmark() {
    if (!user || bookmarkLoading) return
    setBookmarkLoading(true)
    const userRef = doc(db, 'users', user.uid)
    if (bookmarked) {
      await setDoc(userRef, { bookmarks: arrayRemove(post!.id) }, { merge: true })
      setBookmarked(false)
    } else {
      await setDoc(userRef, { bookmarks: arrayUnion(post!.id) }, { merge: true })
      setBookmarked(true)
    }
    setBookmarkLoading(false)
  }

  function handleDuplicate() {
    if (!user || !post) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _createdAt, ...planInput } = post.plan
    const newPlan = savePlan(planInput)
    router.push(`/plans/${newPlan.id}/edit`)
  }

  async function handleFollow() {
    if (!user || followLoading) return
    setFollowLoading(true)
    const userRef = doc(db, 'users', user.uid)
    if (followed) {
      await setDoc(userRef, { following: arrayRemove(post!.authorId) }, { merge: true })
      setFollowed(false)
    } else {
      await setDoc(userRef, { following: arrayUnion(post!.authorId) }, { merge: true })
      setFollowed(true)
    }
    setFollowLoading(false)
  }

  async function handleSave() {
    if (!post) return
    setSaving(true)
    await updateDoc(doc(db, 'posts', id), { comment: editComment })
    setPost({ ...post, comment: editComment })
    setEditing(false)
    setSaving(false)
  }

  async function handleDelete() {
    await deleteDoc(doc(db, 'posts', id))
    router.push('/feed')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">投稿が見つかりません</p>
      </div>
    )
  }

  const isOwn = user?.uid === post.authorId
  const gradient = gradientFor(post.title)
  const totalDays = post.plan.itinerary.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローヘッダー */}
      <div className={`bg-gradient-to-br ${gradient} pt-12 pb-8 px-4 relative`}>
        <Link
          href="/feed"
          className="absolute top-4 left-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        {isOwn && !editing && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-white leading-snug">{post.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white font-medium">
              {totalDays}日間
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white font-medium flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {post.plan.departureDate} 〜 {post.plan.returnDate}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 mt-4 pb-12 space-y-4 relative">
        {/* 投稿者・コメントカード */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={post.authorName} />
              <span className="text-sm font-medium text-gray-700">{post.authorName}</span>
            </div>
            {!isOwn && user && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                  followed
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {followed ? (
                  <UserCheck className="h-3.5 w-3.5" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                {followed ? 'フォロー中' : 'フォロー'}
              </button>
            )}
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                placeholder="コメントを入力..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-lg bg-violet-500 px-4 py-1.5 text-sm text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditComment(post.comment)
                  }}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  キャンセル
                </button>
              </div>
            </div>
          ) : post.comment ? (
            <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {post.comment}
            </p>
          ) : null}

          {/* アクションバー */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLike}
                disabled={!user || likeLoading}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  liked
                    ? 'text-rose-500 bg-rose-50'
                    : 'text-gray-400 hover:text-rose-400 hover:bg-rose-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
              {user && (
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                    bookmarked
                      ? 'text-amber-500 bg-amber-50'
                      : 'text-gray-400 hover:text-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="h-4 w-4 fill-current" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
              )}
              {!user && <span className="text-xs text-gray-400">ログインするといいねできます</span>}
            </div>
            {user && (
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                コピーして使う
              </button>
            )}
          </div>
        </div>

        {/* 削除確認 */}
        {confirmDelete && (
          <div className="rounded-2xl bg-white shadow-sm p-5 border border-red-200">
            <p className="text-sm font-medium text-gray-800">この投稿を削除しますか？</p>
            <p className="text-xs text-gray-400 mt-1">この操作は取り消せません。</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-1.5 text-sm text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                削除する
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 日程タイムライン */}
        {post.plan.itinerary.map((day, dayIdx) => (
          <div key={day.date} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* 日付ヘッダー */}
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {dayIdx + 1}
              </span>
              <span className="text-sm font-semibold text-gray-700">{day.date}</span>
            </div>

            {/* スポット一覧（タイムライン） */}
            <div className="px-5 py-4">
              <div className="relative">
                {/* 縦線 */}
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200" />

                <div className="space-y-4">
                  {day.spots.map((spot, spotIdx) => (
                    <div key={spot.id} className="flex gap-4 relative">
                      {/* ドット */}
                      <div
                        className={`relative z-10 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          spot.isFixed ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                        }`}
                      >
                        {spot.isFixed ? (
                          <Home className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">{spotIdx}</span>
                        )}
                      </div>

                      <div className="flex-1 pb-1">
                        <div className="flex items-baseline gap-2">
                          <p
                            className={`font-medium ${spot.isFixed ? 'text-blue-600' : 'text-gray-800'}`}
                          >
                            {spot.place || '未定'}
                          </p>
                          {spot.time && (
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {spot.time}
                            </span>
                          )}
                        </div>
                        {spot.transportation && (
                          <p className="text-xs text-gray-400 mt-0.5">{spot.transportation}</p>
                        )}
                        {spot.memo && (
                          <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg px-2.5 py-1.5 leading-relaxed">
                            {spot.memo}
                          </p>
                        )}
                        {spotIdx < day.spots.length - 1 && spot.transportation && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span>{spot.transportation}で移動</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
