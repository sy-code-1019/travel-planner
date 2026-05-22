'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  PlusCircle,
  Trash2,
  CalendarDays,
  Compass,
  ClipboardList,
} from 'lucide-react'
import { getPlans, deletePlan } from '@/lib/storage'
import type { Plan, PlannedPlan, ExploringPlan } from '@/types/plan'

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

function PlannedCard({ plan, onDelete }: { plan: PlannedPlan; onDelete: () => void }) {
  return (
    <li className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 flex items-center gap-1">
              <ClipboardList className="h-3 w-3" /> しおりあり
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 truncate">{plan.title}</h2>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(plan.departureDate)}
              {plan.departureTime && ` ${plan.departureTime}発`}
              　〜
              {formatDate(plan.returnDate)}
              {plan.returnTime && ` ${plan.returnTime}着`}
            </span>
          </div>
          <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            {calcNights(plan.departureDate, plan.returnDate)} / {plan.itinerary.length}日間
          </span>
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="削除"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </li>
  )
}

function ExploringCard({ plan, onDelete }: { plan: ExploringPlan; onDelete: () => void }) {
  return (
    <li className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Compass className="h-3 w-3" /> 探索中
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 truncate">{plan.title}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-emerald-600 font-medium">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            {plan.prefecture}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {plan.duration}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {plan.departureMonth}ごろ
            </span>
            {plan.purposes.map((p) => (
              <span
                key={p}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="削除"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </li>
  )
}

export default function MyPlansPage() {
  const [plans, setPlans] = useState<Plan[]>(() => getPlans())

  function handleDelete(id: string) {
    if (!confirm('このプランを削除しますか？')) return
    deletePlan(id)
    setPlans(getPlans())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
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
            {plans.map((plan) =>
              plan.mode === 'planned' ? (
                <PlannedCard key={plan.id} plan={plan} onDelete={() => handleDelete(plan.id)} />
              ) : (
                <ExploringCard key={plan.id} plan={plan} onDelete={() => handleDelete(plan.id)} />
              )
            )}
          </ul>
        )}
      </main>
    </div>
  )
}
