import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import MyPlansPage from '@/app/plans/my/page'
import { getPlans, deletePlan } from '@/lib/storage'
import type { Plan } from '@/types/plan'

vi.mock('@/lib/storage', () => ({
  getPlans: vi.fn(),
  deletePlan: vi.fn(),
}))
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    mode: 'planned',
    title: '沖縄旅行',
    departureDate: '2026-07-01',
    departureTime: '',
    returnDate: '2026-07-03',
    returnTime: '',
    createdAt: '2026-06-01T00:00:00.000Z',
    itinerary: [
      {
        date: '2026-07-01',
        spots: [{ id: 's1', place: '那覇', time: '', transportation: '', memo: '' }],
      },
      {
        date: '2026-07-02',
        spots: [{ id: 's2', place: '美ら海水族館', time: '', transportation: '', memo: '' }],
      },
      {
        date: '2026-07-03',
        spots: [{ id: 's3', place: '首里城', time: '', transportation: '', memo: '' }],
      },
    ],
  },
  {
    id: 'plan-2',
    mode: 'planned',
    title: '北海道旅行',
    departureDate: '2026-08-10',
    departureTime: '',
    returnDate: '2026-08-10',
    returnTime: '',
    createdAt: '2026-06-10T00:00:00.000Z',
    itinerary: [
      {
        date: '2026-08-10',
        spots: [{ id: 's4', place: '札幌', time: '', transportation: '', memo: '' }],
      },
    ],
  },
]

describe('MyPlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('プランがない場合「まだ旅行プランがありません」を表示する', () => {
    vi.mocked(getPlans).mockReturnValue([])
    render(<MyPlansPage />)
    expect(screen.getByText('まだ旅行プランがありません')).toBeInTheDocument()
  })

  it('プランがない場合「最初のプランを作る」リンクを表示する', () => {
    vi.mocked(getPlans).mockReturnValue([])
    render(<MyPlansPage />)
    const link = screen.getByText('最初のプランを作る').closest('a')
    expect(link).toHaveAttribute('href', '/plans/new')
  })

  it('プラン一覧のタイトルを表示する', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)
    expect(screen.getByText('沖縄旅行')).toBeInTheDocument()
    expect(screen.getByText('北海道旅行')).toBeInTheDocument()
  })

  it('プランの日程を表示する', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)
    expect(screen.getByText(/2泊3日/)).toBeInTheDocument()
    expect(screen.getByText(/日帰り/)).toBeInTheDocument()
  })

  it('削除ボタンをクリックすると確認モーダルが表示される', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)

    const deleteButtons = screen.getAllByLabelText('削除')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByText('プランを削除しますか？')).toBeInTheDocument()
    expect(screen.getByText(/「沖縄旅行」を削除します/)).toBeInTheDocument()
  })

  it('確認モーダルでキャンセルするとモーダルが閉じる', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)

    fireEvent.click(screen.getAllByLabelText('削除')[0])
    expect(screen.getByText('プランを削除しますか？')).toBeInTheDocument()

    fireEvent.click(screen.getByText('キャンセル'))
    expect(screen.queryByText('プランを削除しますか？')).not.toBeInTheDocument()
  })

  it('確認モーダルで削除するとdeletePlanが呼ばれる', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)

    fireEvent.click(screen.getAllByLabelText('削除')[0])
    fireEvent.click(screen.getByText('削除する'))

    expect(deletePlan).toHaveBeenCalledWith('plan-1')
  })

  it('ヘッダーに新規作成リンクが存在する', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)
    const link = screen.getByText('新規作成').closest('a')
    expect(link).toHaveAttribute('href', '/plans/new')
  })

  it('編集リンクが各プランに存在する', () => {
    vi.mocked(getPlans).mockReturnValue(mockPlans)
    render(<MyPlansPage />)
    const editLinks = screen.getAllByLabelText('編集')
    expect(editLinks[0].closest('a')).toHaveAttribute('href', '/plans/plan-1/edit')
    expect(editLinks[1].closest('a')).toHaveAttribute('href', '/plans/plan-2/edit')
  })
})
