export type Transportation = '飛行機' | '電車' | '車' | 'バス' | 'その他'

export interface Plan {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  transportation: Transportation
  notes: string
  createdAt: string
}

export type PlanInput = Omit<Plan, 'id' | 'createdAt'>
