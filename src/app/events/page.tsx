'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { JAPAN_EVENTS } from '@/data/events'
import type { JapanEvent } from '@/data/events'

const CATEGORY_STYLE: Record<
  JapanEvent['category'],
  { badge: string; border: string; label: string }
> = {
  花火: { badge: 'bg-rose-100 text-rose-600', border: 'border-l-rose-400', label: '🎆 花火' },
  祭り: { badge: 'bg-amber-100 text-amber-700', border: 'border-l-amber-400', label: '🎋 祭り' },
  花: { badge: 'bg-pink-100 text-pink-600', border: 'border-l-pink-400', label: '🌸 花' },
}

function formatDate(month: number, startDay: number, endDay: number): string {
  if (startDay === endDay) return `${month}月${startDay}日`
  return `${month}月${startDay}日〜${endDay}日`
}

function EventCard({ event }: { event: JapanEvent }) {
  const style = CATEGORY_STYLE[event.category]
  return (
    <div className={`rounded-xl bg-white shadow-sm border-l-4 ${style.border} p-4`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <p className="font-bold text-gray-800 text-sm">{event.name}</p>
      <p className="text-xs font-medium text-blue-500 mt-0.5">
        {formatDate(event.month, event.startDay, event.endDay)}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
        📍 {event.prefecture} · {event.location}
      </p>
      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{event.description}</p>
    </div>
  )
}

export default function EventsPage() {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1

  const currentEvents = useMemo(
    () =>
      JAPAN_EVENTS.filter((e) => e.month === currentMonth).sort((a, b) => a.startDay - b.startDay),
    [currentMonth]
  )

  const nextEvents = useMemo(
    () => JAPAN_EVENTS.filter((e) => e.month === nextMonth).sort((a, b) => a.startDay - b.startDay),
    [nextMonth]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <Link href="/plans" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Sparkles className="h-5 w-5 text-rose-500" />
          <span className="text-lg font-bold text-gray-800">今月・来月のイベント</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-gray-800">{currentMonth}月開催</span>
            <span className="text-xs font-medium bg-rose-500 text-white px-2 py-0.5 rounded-full">
              今月
            </span>
          </div>
          {currentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">今月のイベントはありません</p>
          ) : (
            <div className="space-y-3">
              {currentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-gray-800">{nextMonth}月開催</span>
            <span className="text-xs font-medium bg-gray-400 text-white px-2 py-0.5 rounded-full">
              来月
            </span>
          </div>
          {nextEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">来月のイベントはありません</p>
          ) : (
            <div className="space-y-3">
              {nextEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
