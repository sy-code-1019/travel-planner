import type { Plan, PlannedPlan, ExploringPlan } from '@/types/plan'

const STORAGE_KEY = 'travel-planner:plans'

export type PlanInput =
  | Omit<PlannedPlan, 'id' | 'createdAt'>
  | Omit<ExploringPlan, 'id' | 'createdAt'>

export function getPlans(): Plan[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? (JSON.parse(data) as Plan[]) : []
}

export function savePlan(input: PlanInput): Plan {
  const plan = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  } as Plan
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
