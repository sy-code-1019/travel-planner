'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Plus, Trash2, CheckCircle2, Search, Home } from 'lucide-react'
import { getPlans, updatePlan } from '@/lib/storage'
import SpotSearchModal from '@/components/SpotSearchModal'
import { formatDateJP, newSpot, newFixedSpot } from '@/lib/plan-utils'
import type { Transportation, DayPlan, Spot, Plan } from '@/types/plan'

const SPOT_TRANSPORTS: Transportation[] = ['徒歩', '電車・新幹線', '車', 'バス', '飛行機', 'その他']

function ensureFixedSpots(itinerary: DayPlan[]): DayPlan[] {
  if (itinerary.length === 0) return itinerary
  return itinerary.map((day, idx) => {
    const isFirst = idx === 0
    const isLast = idx === itinerary.length - 1
    const spots = [...day.spots]
    if (!spots[0]?.isFixed) {
      spots.unshift(newFixedSpot(isFirst ? '自宅' : ''))
    }
    if (!spots[spots.length - 1]?.isFixed) {
      spots.push(newFixedSpot(isLast ? '自宅' : ''))
    }
    return { ...day, spots }
  })
}

function EditPlanForm({ plan }: { plan: Plan }) {
  const router = useRouter()

  const [title, setTitle] = useState(plan.title)
  const [departureDate, setDepartureDate] = useState(plan.departureDate)
  const [returnDate, setReturnDate] = useState(plan.returnDate)
  const [itinerary, setItinerary] = useState<DayPlan[]>(() => ensureFixedSpots(plan.itinerary))
  const [dateError, setDateError] = useState('')
  const [searchTarget, setSearchTarget] = useState<{ dayIdx: number; spotId: string } | null>(null)

  function addSpot(dayIdx: number) {
    setItinerary((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d
        const spots = [...d.spots]
        // 末尾の固定スポット（帰着地）の直前に挿入
        spots.splice(spots.length - 1, 0, newSpot())
        return { ...d, spots }
      })
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
    if (!departureDate || !returnDate) {
      setDateError('出発日と帰宅日を入力してください')
      return
    }
    if (returnDate < departureDate) {
      setDateError('帰宅日は出発日より後にしてください')
      return
    }
    const updated: Plan = {
      id: plan.id,
      mode: 'planned',
      createdAt: plan.createdAt,
      title,
      departureDate,
      departureTime: '',
      returnDate,
      returnTime: '',
      itinerary,
    }
    updatePlan(updated)
    router.push('/plans/my')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SpotSearchModal
        isOpen={searchTarget !== null}
        onSelectSpot={(spot) => {
          if (searchTarget) {
            updateSpot(searchTarget.dayIdx, searchTarget.spotId, 'place', spot.place)
            setSearchTarget(null)
          }
        }}
        onClose={() => setSearchTarget(null)}
      />

      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/plans/my')}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-gray-800">プランを編集</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        {/* タイトル */}
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
          <label className="block text-sm font-medium text-gray-700">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 日程 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" /> 日程
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">出発日</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">帰宅日</label>
              <input
                type="date"
                value={returnDate}
                min={departureDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          {dateError && <p className="text-sm text-red-500">{dateError}</p>}
        </div>

        {/* しおり */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700">✈️ しおり</h2>
          <p className="text-xs text-gray-400 mt-1">
            「おすすめ」からスポットを検索して入力できます
          </p>
        </div>

        {itinerary.map((day, dayIdx) => (
          <div key={day.date} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {dayIdx + 1}
              </span>
              <p className="font-semibold text-gray-700">
                Day {dayIdx + 1}　{formatDateJP(day.date)}
              </p>
            </div>
            <div className="p-4 space-y-3">
              {day.spots.map((spot, spotIdx) => (
                <div
                  key={spot.id}
                  className={`rounded-xl border p-3 space-y-2 ${
                    spot.isFixed ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {spot.isFixed && (
                    <div className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600">
                        {spotIdx === 0 ? '出発地' : '帰着地'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {!spot.isFixed && (
                      <span className="text-xs font-bold text-blue-500 bg-blue-50 rounded-full px-2 py-0.5">
                        {spotIdx}
                      </span>
                    )}
                    <input
                      type="time"
                      value={spot.time}
                      onChange={(e) => updateSpot(dayIdx, spot.id, 'time', e.target.value)}
                      className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {!spot.isFixed && (
                      <button
                        onClick={() => removeSpot(dayIdx, spot.id)}
                        className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spot.place}
                      onChange={(e) => updateSpot(dayIdx, spot.id, 'place', e.target.value)}
                      placeholder={
                        spot.isFixed
                          ? spotIdx === 0
                            ? '出発地を入力'
                            : '帰着地を入力'
                          : '場所・スポット名'
                      }
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        spot.isFixed ? 'border-blue-200 bg-white' : 'border-gray-200'
                      }`}
                    />
                    {!spot.isFixed && (
                      <button
                        onClick={() => setSearchTarget({ dayIdx, spotId: spot.id })}
                        className="flex-shrink-0 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
                      >
                        <Search className="h-3.5 w-3.5" /> おすすめ
                      </button>
                    )}
                  </div>
                  <select
                    value={spot.transportation}
                    onChange={(e) => updateSpot(dayIdx, spot.id, 'transportation', e.target.value)}
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
          disabled={!title.trim()}
          onClick={handleSave}
          className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-5 w-5" /> 変更を保存する
        </button>
      </main>
    </div>
  )
}

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const found = getPlans().find((p) => p.id === id) ?? null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(found)

    setLoaded(true)
  }, [id])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">プランが見つかりませんでした</p>
      </div>
    )
  }

  return <EditPlanForm plan={plan} />
}
