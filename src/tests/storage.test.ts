import { describe, it, expect, beforeEach } from 'vitest'
import { getPlans, savePlan, updatePlan, deletePlan } from '@/lib/storage'
import type { PlannedPlan } from '@/types/plan'

const basePlanInput = {
  mode: 'planned' as const,
  title: 'テスト旅行',
  departureDate: '2026-07-01',
  departureTime: '09:00',
  returnDate: '2026-07-03',
  returnTime: '18:00',
  itinerary: [
    {
      date: '2026-07-01',
      spots: [
        {
          id: 's1',
          time: '09:00',
          place: '東京駅',
          transportation: '電車・新幹線',
          memo: '',
          isFixed: true,
        },
        { id: 's2', time: '11:00', place: '浅草', transportation: '電車・新幹線', memo: '' },
        {
          id: 's3',
          time: '20:00',
          place: 'ホテル',
          transportation: '徒歩',
          memo: '',
          isFixed: true,
        },
      ],
    },
  ],
}

beforeEach(() => {
  localStorage.clear()
})

describe('savePlan', () => {
  it('idとcreatedAtが付与されて保存される', () => {
    const plan = savePlan(basePlanInput)

    expect(plan.id).toBeTruthy()
    expect(plan.createdAt).toBeTruthy()
    expect(plan.title).toBe('テスト旅行')
    expect(plan.mode).toBe('planned')
  })

  it('複数保存すると先頭に追加される', () => {
    savePlan({ ...basePlanInput, title: '旅行A' })
    savePlan({ ...basePlanInput, title: '旅行B' })

    const plans = getPlans()
    expect(plans[0].title).toBe('旅行B')
    expect(plans[1].title).toBe('旅行A')
  })

  it('保存するたびに異なるidが生成される', () => {
    const planA = savePlan(basePlanInput)
    const planB = savePlan(basePlanInput)

    expect(planA.id).not.toBe(planB.id)
  })
})

describe('getPlans', () => {
  it('何も保存されていない場合は空配列を返す', () => {
    expect(getPlans()).toEqual([])
  })

  it('保存したプランを全件返す', () => {
    savePlan({ ...basePlanInput, title: '旅行1' })
    savePlan({ ...basePlanInput, title: '旅行2' })

    expect(getPlans()).toHaveLength(2)
  })

  it('modeがplannedでないデータは返さない', () => {
    localStorage.setItem(
      'travel-planner:plans',
      JSON.stringify([{ mode: 'draft', title: '下書き' }])
    )

    expect(getPlans()).toHaveLength(0)
  })
})

describe('updatePlan', () => {
  it('タイトルを更新できる', () => {
    const plan = savePlan(basePlanInput)
    const updated: PlannedPlan = { ...plan, title: '更新後タイトル' }

    updatePlan(updated)

    const plans = getPlans()
    expect(plans.find((p) => p.id === plan.id)?.title).toBe('更新後タイトル')
  })

  it('存在しないidを更新しても他のプランに影響しない', () => {
    savePlan(basePlanInput)
    const ghost: PlannedPlan = { ...basePlanInput, id: 'nonexistent', createdAt: '' }

    updatePlan(ghost)

    expect(getPlans()).toHaveLength(1)
  })
})

describe('deletePlan', () => {
  it('指定したidのプランを削除できる', () => {
    const plan = savePlan(basePlanInput)

    deletePlan(plan.id)

    expect(getPlans()).toHaveLength(0)
  })

  it('対象のプランだけ削除され他は残る', () => {
    const planA = savePlan({ ...basePlanInput, title: '旅行A' })
    savePlan({ ...basePlanInput, title: '旅行B' })

    deletePlan(planA.id)

    const plans = getPlans()
    expect(plans).toHaveLength(1)
    expect(plans[0].title).toBe('旅行B')
  })

  it('存在しないidを削除しても既存プランは残る', () => {
    savePlan(basePlanInput)

    deletePlan('nonexistent')

    expect(getPlans()).toHaveLength(1)
  })
})
