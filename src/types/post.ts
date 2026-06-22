import type { PlannedPlan } from './plan'

export interface Post {
  id: string
  authorId: string
  authorName: string
  title: string
  comment: string
  plan: PlannedPlan
  createdAt: number
  likeCount?: number
  likedBy?: string[]
}
