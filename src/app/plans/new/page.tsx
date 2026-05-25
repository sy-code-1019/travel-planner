'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Star,
  X,
} from 'lucide-react'
import { savePlan } from '@/lib/storage'
import { REGIONS } from '@/data/recommendations'
import type { TravelPurpose, Transportation, DayPlan, Spot } from '@/types/plan'

const PURPOSES: { value: TravelPurpose; emoji: string }[] = [
  { value: '温泉', emoji: '♨️' },
  { value: 'グルメ', emoji: '🍜' },
  { value: '観光', emoji: '🏯' },
  { value: 'ドライブ', emoji: '🚗' },
  { value: '景色', emoji: '🏔️' },
  { value: 'アクティビティ', emoji: '🏄' },
]

const SPOT_TRANSPORTS: Transportation[] = ['徒歩', '電車・新幹線', '車', 'バス', '飛行機', 'その他']

interface SearchResult {
  name: string
  description: string
  rating: number
  photoRef?: string | null
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < current ? 'w-2 bg-blue-500' : i === current ? 'w-6 bg-blue-400' : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function SpotSearchModal({
  onSelect,
  onClose,
}: {
  onSelect: (name: string) => void
  onClose: () => void
}) {
  const [region, setRegion] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [purposes, setPurposes] = useState<TravelPurpose[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<'form' | 'results'>('form')

  async function handleSearch() {
    if (!prefecture) return
    setLoading(true)
    setPhase('results')
    try {
      const query = new URLSearchParams({ prefecture, purposes: purposes.join(',') })
      const res = await fetch(`/api/places?${query}`)
      const data = (await res.json()) as { spots?: SearchResult[] }
      setResults(data.spots ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

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

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {phase === 'form' ? (
            <>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">エリア</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(REGIONS).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRegion(r)
                        setPrefecture('')
                      }}
                      className={`rounded-lg py-2 text-sm border-2 transition-all ${
                        region === r
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {region && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">都道府県</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {REGIONS[region].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => setPrefecture(pref)}
                        className={`rounded-lg py-2 text-xs border-2 transition-all ${
                          prefecture === pref
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {prefecture && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">目的（任意・複数選択可）</p>
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
                </div>
              )}
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
            <ul className="space-y-2">
              {results.slice(0, 15).map((spot, i) => (
                <li key={i}>
                  <button
                    onClick={() => onSelect(spot.name)}
                    className="w-full rounded-xl border border-gray-100 text-left hover:border-blue-300 hover:bg-blue-50 transition-all overflow-hidden"
                  >
                    {spot.photoRef ? (
                      <img
                        src={`/api/places/photo?ref=${spot.photoRef}`}
                        alt={spot.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800">{spot.name}</p>
                      {spot.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{spot.description}</p>
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
          )}
        </div>

        {phase === 'form' && (
          <div className="p-4 border-t flex-shrink-0">
            <button
              disabled={!prefecture}
              onClick={handleSearch}
              className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> このエリアで検索
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function generateDays(start: string, end: string): string[] {
  const days: string[] = []
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    days.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function formatDateJP(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

function newSpot(): Spot {
  return { id: crypto.randomUUID(), time: '', place: '', transportation: '', memo: '' }
}

export default function NewPlanPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')

  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const [dateError, setDateError] = useState('')

  const [searchTarget, setSearchTarget] = useState<{ dayIdx: number; spotId: string } | null>(null)

  function confirmDates() {
    if (!departureDate || !returnDate) return
    if (departureDate < today) {
      setDateError('出発日は今日以降にしてください')
      return
    }
    if (returnDate < departureDate) {
      setDateError('帰宅日は出発日より後にしてください')
      return
    }
    if (
      departureDate === returnDate &&
      departureTime &&
      returnTime &&
      returnTime <= departureTime
    ) {
      setDateError('日帰りの場合、帰宅時刻は出発時刻より後にしてください')
      return
    }
    setDateError('')
    const days = generateDays(departureDate, returnDate)
    setItinerary(days.map((date) => ({ date, spots: [newSpot()] })))
    setStep(2)
  }

  function addSpot(dayIdx: number) {
    setItinerary((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, spots: [...d.spots, newSpot()] } : d))
    )
  }

  function removeSpot(dayIdx: number, spotId: string) {
    setItinerary((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, spots: d.spots.filter((s) => s.id !== spotId) } : d
      )
    )
  }

  function updateSpot(dayIdx: number, spotId: string, field: keyof Spot, value: string) {
    setItinerary((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, spots: d.spots.map((s) => (s.id === spotId ? { ...s, [field]: value } : s)) }
          : d
      )
    )
  }

  function handleSave() {
    savePlan({
      mode: 'planned',
      title,
      departureDate,
      departureTime,
      returnDate,
      returnTime,
      itinerary,
    })
    router.push('/plans/my')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {searchTarget && (
        <SpotSearchModal
          onSelect={(name) => {
            updateSpot(searchTarget.dayIdx, searchTarget.spotId, 'place', name)
            setSearchTarget(null)
          }}
          onClose={() => setSearchTarget(null)}
        />
      )}

      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step === 0 ? router.push('/plans') : setStep((s) => s - 1))}
              className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-gray-800">旅行プランを作成</span>
            </div>
          </div>
          <StepIndicator current={step} total={3} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        {/* Step 0: タイトル */}
        {step === 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-md space-y-5">
            <h2 className="text-xl font-bold text-gray-800">旅のタイトルをつけよう</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 夏の北海道3泊4日"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              disabled={!title.trim()}
              onClick={() => setStep(1)}
              className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              次へ <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: 日程・時間 */}
        {step === 1 && (
          <div className="rounded-2xl bg-white p-6 shadow-md space-y-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              日程と時間を決めよう
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出発日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  min={today}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出発時刻</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  帰宅日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={departureDate || today}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">帰宅時刻</label>
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            {dateError && <p className="text-sm text-red-500">{dateError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep(0)}
                className="rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> 戻る
              </button>
              <button
                disabled={!departureDate || !returnDate}
                onClick={confirmDates}
                className="rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                しおりを作成 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: しおり */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-md">
              <h2 className="text-lg font-bold text-gray-800">✈️ 旅のしおりを作ろう</h2>
              <p className="text-sm text-gray-500 mt-1">
                各スポットの「おすすめ」ボタンからGoogle Maps評価順でスポットを探せます
              </p>
            </div>

            {itinerary.map((day, dayIdx) => (
              <div key={day.date} className="rounded-2xl bg-white shadow-md overflow-hidden">
                <div className="bg-blue-500 px-4 py-3">
                  <p className="font-bold text-white">
                    Day {dayIdx + 1}　{formatDateJP(day.date)}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {day.spots.map((spot, spotIdx) => (
                    <div
                      key={spot.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 rounded-full px-2 py-0.5">
                          {spotIdx + 1}
                        </span>
                        <input
                          type="time"
                          value={spot.time}
                          onChange={(e) => updateSpot(dayIdx, spot.id, 'time', e.target.value)}
                          className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          onClick={() => removeSpot(dayIdx, spot.id)}
                          disabled={day.spots.length === 1}
                          className="ml-auto text-gray-300 hover:text-red-400 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={spot.place}
                          onChange={(e) => updateSpot(dayIdx, spot.id, 'place', e.target.value)}
                          placeholder="場所・スポット名"
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          onClick={() => setSearchTarget({ dayIdx, spotId: spot.id })}
                          className="flex-shrink-0 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <Search className="h-3.5 w-3.5" /> おすすめ
                        </button>
                      </div>
                      <select
                        value={spot.transportation}
                        onChange={(e) =>
                          updateSpot(dayIdx, spot.id, 'transportation', e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600"
                      >
                        <option value="">移動手段（任意）</option>
                        {SPOT_TRANSPORTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={spot.memo}
                        onChange={(e) => updateSpot(dayIdx, spot.id, 'memo', e.target.value)}
                        placeholder="メモ（任意）"
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addSpot(dayIdx)}
                    className="w-full rounded-xl border-2 border-dashed border-blue-200 py-2 text-sm text-blue-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> スポットを追加
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" /> プランを保存する
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
