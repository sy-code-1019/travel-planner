'use client'

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
]

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const color = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  const sizeClass = size === 'md' ? 'h-8 w-8 text-sm' : 'h-6 w-6 text-xs'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${color} ${sizeClass} font-bold text-white`}
    >
      {name.charAt(0)}
    </span>
  )
}
