export type TravelMode = 'planned' | 'exploring'
export type MainTransport = '歩き中心' | '車' | '電車・新幹線' | '飛行機'
export type TravelPurpose = '温泉' | 'グルメ' | '観光' | 'ドライブ' | '景色' | 'アクティビティ'
export type TripDuration = '日帰り' | '1泊2日' | '2泊3日' | '3泊4日以上' | '1週間以上'
export type Transportation = '飛行機' | '電車・新幹線' | '車' | 'バス' | '徒歩' | 'その他'

export interface Spot {
  id: string
  time: string
  place: string
  transportation: Transportation | ''
  memo: string
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

export interface ExploringPlan {
  id: string
  mode: 'exploring'
  title: string
  duration: TripDuration
  departureMonth: string
  region: string
  prefecture: string
  purposes: TravelPurpose[]
  mainTransport: MainTransport
  createdAt: string
}

export type Plan = PlannedPlan | ExploringPlan
