import type { Plan, PlanInput } from '@/types/plan'

const STORAGE_KEY = 'travel-planner:plans'

export function getPlans(): Plan[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? (JSON.parse(data) as Plan[]) : []
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

export function deletePlan(id: string): void {
  const plans = getPlans().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}
