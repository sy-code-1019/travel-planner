'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, BookOpen } from 'lucide-react'
import { getRecommendations } from '@/data/recommendations'
import type { TravelPurpose } from '@/types/plan'

const PURPOSE_EMOJI: Record<TravelPurpose, string> = {
  温泉: '♨️',
  グルメ: '🍜',
  観光: '🏯',
  ドライブ: '🚗',
  景色: '🏔️',
  アクティビティ: '🏄',
}

function ResultContent() {
  const params = useSearchParams()
  const prefecture = params.get('prefecture') ?? ''
  const purposes = (params.get('purposes') ?? '').split(',').filter(Boolean) as TravelPurpose[]

  const spots = getRecommendations(prefecture, purposes)

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

        {/* スポット一覧 */}
        {spots.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <p className="text-gray-400">該当するスポットが見つかりませんでした</p>
            <Link href="/plans/new" className="mt-4 inline-block text-sm text-blue-500 underline">
              条件を変えて探す
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 px-1">{spots.length}件のスポットが見つかりました</p>
            <ul className="space-y-3">
              {spots.map((spot) => (
                <li key={spot.name} className="rounded-2xl bg-white p-5 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800">{spot.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{spot.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          目安: {spot.suggestedTime}
                        </span>
                        {spot.purposes.map((p) => (
                          <span
                            key={p}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {PURPOSE_EMOJI[p]} {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* アクション */}
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
            <MapPin className="h-4 w-4" />
            もう一度探す
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          読み込み中...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
