import type { Plan, PlannedPlan } from '@/types/plan'

const STORAGE_KEY = 'travel-planner:plans'

export type PlanInput = Omit<PlannedPlan, 'id' | 'createdAt'>

export function getPlans(): Plan[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  const all = data ? (JSON.parse(data) as { mode?: string }[]) : []
  return all.filter((p): p is Plan => p.mode === 'planned')
}

export function savePlan(input: PlanInput): Plan {
  const plan: Plan = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const plans = getPlans()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([plan, ...plans]))
  return plan
}

export function updatePlan(updated: Plan): void {
  const plans = getPlans().map((p) => (p.id === updated.id ? updated : p))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export function deletePlan(id: string): void {
  const plans = getPlans().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}
