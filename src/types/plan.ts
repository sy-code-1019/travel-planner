export type TravelPurpose = '温泉' | 'グルメ' | '観光' | 'ドライブ' | '景色' | 'アクティビティ'
export type Transportation = '飛行機' | '電車・新幹線' | '車' | 'バス' | '徒歩' | 'その他'

export interface Spot {
  id: string
  time: string
  place: string
  transportation: Transportation | ''
  memo: string
  isFixed?: boolean
}

export interface DayPlan {
  date: string
  spots: Spot[]
}

export interface PlannedPlan {
  id: string
  mode: 'planned'
  title: string
  departureDate: string
  departureTime: string
  returnDate: string
  returnTime: string
  itinerary: DayPlan[]
  createdAt: string
}

export type Plan = PlannedPlan
