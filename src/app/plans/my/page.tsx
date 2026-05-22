'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  PlusCircle,
  Trash2,
  CalendarDays,
  AlertTriangle,
  Pencil,
} from 'lucide-react'
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

function DeleteModal({
  planTitle,
  onConfirm,
  onCancel,
}: {
  planTitle: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-base font-bold text-gray-800">プランを削除しますか？</h2>
        </div>
        <p className="text-sm text-gray-500">
          「{planTitle}」を削除します。この操作は取り消せません。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan, onDelete }: { plan: Plan; onDelete: () => void }) {
  return (
    <li className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
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
        <div className="flex flex-col gap-1 flex-shrink-0">
          <Link
            href={`/plans/${plan.id}/edit`}
            className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
            aria-label="編集"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

export default function MyPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlans(getPlans())
  }, [])

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deletePlan(deleteTarget.id)
    setPlans(getPlans())
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {deleteTarget && (
        <DeleteModal
          planTitle={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

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
              <PlanCard key={plan.id} plan={plan} onDelete={() => setDeleteTarget(plan)} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
