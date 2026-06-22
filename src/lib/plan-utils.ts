import type { Spot } from '@/types/plan'

export function formatDateJP(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function newSpot(): Spot {
  return { id: crypto.randomUUID(), time: '', place: '', transportation: '', memo: '' }
}

export function newFixedSpot(place: string): Spot {
  return { id: crypto.randomUUID(), time: '', place, transportation: '', memo: '', isFixed: true }
}
