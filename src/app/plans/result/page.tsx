'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, BookOpen, RotateCcw } from 'lucide-react'
import type { TravelPurpose } from '@/types/plan'

const PURPOSE_EMOJI: Record<TravelPurpose, string> = {
  温泉: '♨️',
  グルメ: '🍜',
  観光: '🏯',
  ドライブ: '🚗',
  景色: '🏔️',
  アクティビティ: '🏄',
}

interface Spot {
  name: string
  description: string
  rating: number
  ratingsTotal: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  )
}

function ResultContent() {
  const params = useSearchParams()
  const prefecture = params.get('prefecture') ?? ''
  const purposes = (params.get('purposes') ?? '').split(',').filter(Boolean) as TravelPurpose[]

  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!prefecture) return

    const query = new URLSearchParams({
      prefecture,
      purposes: purposes.join(','),
    })

    fetch(`/api/places?${query}`)
      .then((r) => r.json())
      .then((data: { spots?: Spot[]; error?: string }) => {
        if (data.error) throw new Error(data.error)
        setSpots(data.spots ?? [])
      })
      .catch(() => setError('スポット情報の取得に失敗しました'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefecture])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <Link href="/plans" className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            <span className="font-bold text-gray-800">おすすめスポット</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        {/* 検索条件サマリー */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <p className="text-sm text-gray-500 mb-2">検索条件</p>
          <p className="text-xl font-bold text-gray-800 flex items-center gap-1">
            <MapPin className="h-5 w-5 text-emerald-500" />
            {prefecture}
          </p>
          {purposes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {purposes.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700 font-medium"
                >
                  {PURPOSE_EMOJI[p]} {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ローディング */}
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md space-y-3">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
            <p className="text-gray-500 text-sm">スポットを検索中...</p>
          </div>
        )}

        {/* エラー */}
        {!loading && error && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-red-500">{error}</p>
            <Link href="/plans/new" className="mt-4 inline-block text-sm text-blue-500 underline">
              もう一度試す
            </Link>
          </div>
        )}

        {/* 結果 */}
        {!loading && !error && (
          <>
            {spots.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-md">
                <p className="text-gray-400">条件に合うスポットが見つかりませんでした</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 px-1">
                  {spots.length}件のスポットが見つかりました（評価3以上・評価順）
                </p>
                <ul className="space-y-3">
                  {spots.map((spot, i) => (
                    <li key={i} className="rounded-2xl bg-white p-5 shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-800">{spot.name}</h3>
                          {spot.description && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {spot.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <StarRating rating={spot.rating} />
                            {spot.ratingsTotal > 0 && (
                              <span className="text-xs text-gray-400">
                                ({spot.ratingsTotal.toLocaleString()}件)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {/* アクション */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/plans/my"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              マイプランを見る
            </Link>
            <Link
              href="/plans/new"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              もう一度探す
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
