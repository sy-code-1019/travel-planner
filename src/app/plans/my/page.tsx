'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, PlusCircle, Trash2, CalendarDays, Train } from 'lucide-react'
import { getPlans, deletePlan } from '@/lib/storage'
import type { Plan } from '@/types/plan'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function calcNights(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  return diff > 0 ? `${diff}泊${diff + 1}日` : '日帰り'
}

export default function MyPlansPage() {
  // lazy initializer でマウント時に一度だけ localStorage から読み込む
  const [plans, setPlans] = useState<Plan[]>(() => getPlans())

  function handleDelete(id: string) {
    if (!confirm('このプランを削除しますか？')) return
    deletePlan(id)
    setPlans(getPlans())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/plans" className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-gray-800">マイプラン</span>
            </div>
          </div>
          <Link
            href="/plans/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            新規作成
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {plans.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">まだ旅行プランがありません</p>
            <Link
              href="/plans/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              最初のプランを作る
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {plans.map((plan) => (
              <li key={plan.id} className="rounded-2xl bg-white p-5 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 truncate">{plan.title}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-blue-600 font-medium">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {plan.destination}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(plan.startDate)} 〜 {formatDate(plan.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Train className="h-4 w-4" />
                        {plan.transportation}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600 text-xs font-medium">
                        {calcNights(plan.startDate, plan.endDate)}
                      </span>
                    </div>
                    {plan.notes && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{plan.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="削除"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
