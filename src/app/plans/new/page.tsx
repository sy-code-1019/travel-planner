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
  Home,
} from 'lucide-react'
import { savePlan } from '@/lib/storage'
import SpotSearchModal from '@/components/SpotSearchModal'
import { formatDateJP, newSpot, newFixedSpot } from '@/lib/plan-utils'
import type { Transportation, DayPlan, Spot } from '@/types/plan'

const SPOT_TRANSPORTS: Transportation[] = ['徒歩', '電車・新幹線', '車', 'バス', '飛行機', 'その他']

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

export default function NewPlanPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')

  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
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
    setDateError('')
    const days = generateDays(departureDate, returnDate)
    setItinerary(
      days.map((date, idx) => {
        const isFirst = idx === 0
        const isLast = idx === days.length - 1
        return {
          date,
          spots: [
            newFixedSpot(isFirst ? '自宅' : ''),
            newSpot(),
            newFixedSpot(isLast ? '自宅' : ''),
          ],
        }
      })
    )
    setStep(2)
  }

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
    savePlan({
      mode: 'planned',
      title,
      departureDate,
      departureTime: '',
      returnDate,
      returnTime: '',
      itinerary,
    })
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
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
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
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              日程を決めよう
            </h2>
            <div className="space-y-4">
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
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800">✈️ 旅のしおりを作ろう</h2>
              <p className="text-sm text-gray-500 mt-1">
                各スポットの「おすすめ」ボタンからGoogle Maps評価順でスポットを探せます
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
