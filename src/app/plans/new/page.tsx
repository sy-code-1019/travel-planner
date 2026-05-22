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
  Compass,
  ClipboardList,
} from 'lucide-react'
import { savePlan } from '@/lib/storage'
import { REGIONS } from '@/data/recommendations'
import type {
  TravelMode,
  TravelPurpose,
  MainTransport,
  TripDuration,
  Transportation,
  DayPlan,
  Spot,
} from '@/types/plan'

const PURPOSES: { value: TravelPurpose; emoji: string }[] = [
  { value: '温泉', emoji: '♨️' },
  { value: 'グルメ', emoji: '🍜' },
  { value: '観光', emoji: '🏯' },
  { value: 'ドライブ', emoji: '🚗' },
  { value: '景色', emoji: '🏔️' },
  { value: 'アクティビティ', emoji: '🏄' },
]

const TRANSPORTS: { value: MainTransport; emoji: string }[] = [
  { value: '歩き中心', emoji: '🚶' },
  { value: '車', emoji: '🚗' },
  { value: '電車・新幹線', emoji: '🚄' },
  { value: '飛行機', emoji: '✈️' },
]

const DURATIONS: TripDuration[] = ['日帰り', '1泊2日', '2泊3日', '3泊4日以上', '1週間以上']

const SPOT_TRANSPORTS: Transportation[] = ['徒歩', '電車・新幹線', '車', 'バス', '飛行機', 'その他']

const MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
  '未定',
]

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

export default function NewPlanPage() {
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState<TravelMode | null>(null)

  // planned
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const [dateError, setDateError] = useState('')

  // exploring
  const [duration, setDuration] = useState<TripDuration | ''>('')
  const [depMonth, setDepMonth] = useState('')
  const [region, setRegion] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [purposes, setPurposes] = useState<TravelPurpose[]>([])
  const [mainTransport, setMainTransport] = useState<MainTransport | ''>('')

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
    setItinerary(days.map((date) => ({ date, spots: [newSpot()] })))
    setStep(3)
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

  function handleSavePlanned() {
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

  function handleSaveExploring() {
    savePlan({
      mode: 'exploring',
      title,
      duration: duration as TripDuration,
      departureMonth: depMonth,
      region,
      prefecture,
      purposes,
      mainTransport: mainTransport as MainTransport,
    })
    router.push(
      '/plans/result?prefecture=' +
        encodeURIComponent(prefecture) +
        '&purposes=' +
        encodeURIComponent(purposes.join(','))
    )
  }

  const totalSteps = mode === 'planned' ? 4 : 7

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
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
          {mode && <StepIndicator current={step} total={totalSteps} />}
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
              placeholder="例: 夏の沖縄3泊4日"
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

        {/* Step 1: モード選択 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-lg font-bold text-gray-800">「{title}」</p>
              <p className="text-gray-500 text-sm mt-1">プランはもう決まっていますか？</p>
            </div>
            <button
              onClick={() => {
                setMode('planned')
                setStep(2)
              }}
              className="w-full rounded-2xl bg-blue-500 p-5 text-white shadow-md hover:-translate-y-1 transition-transform flex items-center gap-4"
            >
              <ClipboardList className="h-10 w-10 flex-shrink-0" />
              <div className="text-left">
                <p className="text-lg font-bold">決まっている</p>
                <p className="text-sm opacity-80">行き先・日程が決まっている方はこちら</p>
              </div>
            </button>
            <button
              onClick={() => {
                setMode('exploring')
                setStep(2)
              }}
              className="w-full rounded-2xl bg-emerald-500 p-5 text-white shadow-md hover:-translate-y-1 transition-transform flex items-center gap-4"
            >
              <Compass className="h-10 w-10 flex-shrink-0" />
              <div className="text-left">
                <p className="text-lg font-bold">まだ決まっていない</p>
                <p className="text-sm opacity-80">条件からおすすめスポットを探す</p>
              </div>
            </button>
          </div>
        )}

        {/* planned Step 2: 日程・時間 */}
        {step === 2 && mode === 'planned' && (
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
            <button
              disabled={!departureDate || !returnDate}
              onClick={confirmDates}
              className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              しおりを作成する <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* planned Step 3: しおり */}
        {step === 3 && mode === 'planned' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-md">
              <h2 className="text-lg font-bold text-gray-800">✈️ 旅のしおりを作ろう</h2>
              <p className="text-sm text-gray-500 mt-1">各日程にスポットを追加してください</p>
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
                      <input
                        type="text"
                        value={spot.place}
                        onChange={(e) => updateSpot(dayIdx, spot.id, 'place', e.target.value)}
                        placeholder="場所・スポット名"
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
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
              onClick={handleSavePlanned}
              className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" /> プランを保存する
            </button>
          </div>
        )}

        {/* exploring Step 2: 旅行日数 */}
        {step === 2 && mode === 'exploring' && (
          <div className="rounded-2xl bg-white p-6 shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">何日間の旅にしたいですか？</h2>
            <div className="space-y-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`w-full rounded-xl px-4 py-3 text-left font-medium border-2 transition-all ${
                    duration === d
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              disabled={!duration}
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              次へ <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* exploring Step 3: 出発月 */}
        {step === 3 && mode === 'exploring' && (
          <div className="rounded-2xl bg-white p-6 shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">いつごろ出発したいですか？</h2>
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => setDepMonth(m)}
                  className={`rounded-xl py-3 text-sm font-medium border-2 transition-all ${
                    depMonth === m
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              disabled={!depMonth}
              onClick={() => setStep(4)}
              className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              次へ <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* exploring Step 4: エリア → 都道府県 */}
        {step === 4 && mode === 'exploring' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-md space-y-3">
              <h2 className="text-xl font-bold text-gray-800">エリアを選んでください</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(REGIONS).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRegion(r)
                      setPrefecture('')
                    }}
                    className={`rounded-xl py-3 text-sm font-medium border-2 transition-all ${
                      region === r
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {region && (
              <div className="rounded-2xl bg-white p-6 shadow-md space-y-3">
                <h3 className="font-bold text-gray-700">都道府県を選んでください</h3>
                <div className="grid grid-cols-3 gap-2">
                  {REGIONS[region].map((pref) => (
                    <button
                      key={pref}
                      onClick={() => {
                        setPrefecture(pref)
                        setStep(5)
                      }}
                      className={`rounded-xl py-2.5 text-sm font-medium border-2 transition-all ${
                        prefecture === pref
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* exploring Step 5: 目的 */}
        {step === 5 && mode === 'exploring' && (
          <div className="rounded-2xl bg-white p-6 shadow-md space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">旅の目的は？</h2>
              <p className="text-sm text-gray-500 mt-1">複数選択できます</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                    className={`rounded-xl py-4 font-medium border-2 transition-all flex flex-col items-center gap-1 ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm">{value}</span>
                    {selected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </button>
                )
              })}
            </div>
            <button
              disabled={purposes.length === 0}
              onClick={() => setStep(6)}
              className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              次へ <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* exploring Step 6: 移動手段 */}
        {step === 6 && mode === 'exploring' && (
          <div className="rounded-2xl bg-white p-6 shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">メインの移動手段は？</h2>
            <div className="grid grid-cols-2 gap-3">
              {TRANSPORTS.map(({ value, emoji }) => (
                <button
                  key={value}
                  onClick={() => setMainTransport(value)}
                  className={`rounded-xl py-5 font-medium border-2 transition-all flex flex-col items-center gap-1 ${
                    mainTransport === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-sm">{value}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!mainTransport}
              onClick={handleSaveExploring}
              className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" /> おすすめを見る
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
