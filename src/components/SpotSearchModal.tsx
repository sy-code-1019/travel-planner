'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, MapPin, Search, Star, X } from 'lucide-react'
import { REGIONS } from '@/data/recommendations'
import type { TravelPurpose } from '@/types/plan'

const PURPOSES: { value: TravelPurpose; emoji: string }[] = [
  { value: '温泉', emoji: '♨️' },
  { value: 'グルメ', emoji: '🍜' },
  { value: '観光', emoji: '🏯' },
  { value: 'ドライブ', emoji: '🚗' },
  { value: '景色', emoji: '🏔️' },
  { value: 'アクティビティ', emoji: '🏄' },
]

interface SearchResult {
  name: string
  description: string
  rating: number
  photoRef?: string | null
}

interface SpotSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSpot: (spot: { place: string; memo: string }) => void
}

export default function SpotSearchModal({ isOpen, onClose, onSelectSpot }: SpotSearchModalProps) {
  const [purposes, setPurposes] = useState<TravelPurpose[]>([])
  const [otherKeyword, setOtherKeyword] = useState('')
  const [region, setRegion] = useState('')
  const [area, setArea] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<'form' | 'results'>('form')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15
  const scrollRef = useRef<HTMLDivElement>(null)

  const canSearch =
    purposes.length > 0 || otherKeyword.trim() !== '' || region !== '' || area.trim() !== ''

  async function handleSearch() {
    if (!canSearch) return
    setLoading(true)
    setPhase('results')
    setPage(0)
    try {
      const allPurposes = otherKeyword.trim() ? [...purposes, otherKeyword.trim()] : [...purposes]
      const params = new URLSearchParams({ purposes: allPurposes.join(',') })
      if (area.trim()) params.set('area', area.trim())
      else if (region) params.set('region', region)
      const res = await fetch(`/api/places?${params}`)
      const data = (await res.json()) as { spots?: SearchResult[] }
      setResults(data.spots ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const pagedResults = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl bg-white w-full max-w-sm shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          {phase === 'results' ? (
            <button
              onClick={() => setPhase('form')}
              className="flex items-center gap-1 text-sm text-blue-500 font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> 条件を変更
            </button>
          ) : (
            <p className="text-sm font-bold text-gray-800">おすすめスポットを探す</p>
          )}
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div ref={scrollRef} className="overflow-y-auto flex-1 p-4 space-y-5">
          {phase === 'form' ? (
            <>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">何をしたいですか？（任意）</p>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map(({ value, emoji }) => {
                    const selected = purposes.includes(value)
                    return (
                      <button
                        key={value}
                        onClick={() =>
                          setPurposes((prev) =>
                            selected ? prev.filter((p) => p !== value) : [...prev, value]
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs border-2 transition-all ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-200'
                        }`}
                      >
                        {emoji} {value}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  value={otherKeyword}
                  onChange={(e) => setOtherKeyword(e.target.value)}
                  placeholder="その他（例：サウナ、公園、水族館）"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">どこへ行きますか？（任意）</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Object.keys(REGIONS).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRegion(region === r ? '' : r)
                        setArea('')
                      }}
                      className={`rounded-full px-3 py-1 text-xs border-2 transition-all ${
                        region === r
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value)
                    if (e.target.value) setRegion('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="市区町村で絞り込む（例：横浜、渋谷）"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <p className="text-xs text-gray-400 mt-1.5">いずれか一つ以上入力で検索できます</p>
              </div>
            </>
          ) : loading ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
              <p className="text-sm text-gray-500">検索中...</p>
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              スポットが見つかりませんでした
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {pagedResults.map((spot, i) => (
                  <li key={i}>
                    <button
                      onClick={() => onSelectSpot({ place: spot.name, memo: '' })}
                      className="w-full rounded-xl border border-gray-100 text-left hover:border-blue-300 hover:bg-blue-50 transition-all overflow-hidden"
                    >
                      {spot.photoRef ? (
                        <Image
                          src={`/api/places/photo?ref=${spot.photoRef}`}
                          alt={spot.name}
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800">{spot.name}</p>
                        {spot.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {spot.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-amber-600">{spot.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={page === 0}
                    onClick={() => {
                      setPage((p) => p - 1)
                      scrollRef.current?.scrollTo(0, 0)
                    }}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-50 disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> 前へ
                  </button>
                  <span className="text-xs text-gray-400">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => {
                      setPage((p) => p + 1)
                      scrollRef.current?.scrollTo(0, 0)
                    }}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-50 disabled:opacity-30 transition-colors"
                  >
                    次へ <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {phase === 'form' && (
          <div className="p-4 border-t flex-shrink-0">
            <button
              disabled={!canSearch}
              onClick={handleSearch}
              className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> スポットを検索する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
