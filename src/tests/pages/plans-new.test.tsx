import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import NewPlanPage from '@/app/plans/new/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
vi.mock('@/lib/storage', () => ({
  savePlan: vi.fn((input: unknown) => ({ ...(input as object), id: 'new-id', createdAt: '' })),
}))
vi.mock('@/components/SpotSearchModal', () => ({
  default: () => null,
}))
vi.mock('@/lib/plan-utils', () => ({
  formatDateJP: (d: string) => d,
  newSpot: () => ({
    id: `spot-${Math.random()}`,
    time: '',
    place: '',
    transportation: '',
    memo: '',
  }),
  newFixedSpot: (place: string) => ({
    id: `fixed-${Math.random()}`,
    time: '',
    place,
    transportation: '',
    memo: '',
    isFixed: true,
  }),
}))

describe('NewPlanPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ステップ0: タイトル入力', () => {
    it('タイトル入力フォームを表示する', () => {
      render(<NewPlanPage />)
      expect(screen.getByText('旅のタイトルをつけよう')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('例: 夏の北海道3泊4日')).toBeInTheDocument()
    })

    it('タイトルが空の場合「次へ」ボタンが無効になる', () => {
      render(<NewPlanPage />)
      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).toBeDisabled()
    })

    it('タイトルを入力すると「次へ」ボタンが有効になる', () => {
      render(<NewPlanPage />)
      fireEvent.change(screen.getByPlaceholderText('例: 夏の北海道3泊4日'), {
        target: { value: '沖縄旅行' },
      })
      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).not.toBeDisabled()
    })

    it('空白のみのタイトルでは「次へ」ボタンが無効のまま', () => {
      render(<NewPlanPage />)
      fireEvent.change(screen.getByPlaceholderText('例: 夏の北海道3泊4日'), {
        target: { value: '   ' },
      })
      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).toBeDisabled()
    })
  })

  describe('ステップ遷移', () => {
    it('タイトル入力後「次へ」でステップ1（日程）に進む', () => {
      render(<NewPlanPage />)
      fireEvent.change(screen.getByPlaceholderText('例: 夏の北海道3泊4日'), {
        target: { value: '沖縄旅行' },
      })
      fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
      expect(screen.getByText('日程を決めよう')).toBeInTheDocument()
    })

    it('ステップ1で「戻る」をクリックするとステップ0に戻る', () => {
      render(<NewPlanPage />)
      fireEvent.change(screen.getByPlaceholderText('例: 夏の北海道3泊4日'), {
        target: { value: '沖縄旅行' },
      })
      fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
      expect(screen.getByText('日程を決めよう')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /戻る/ }))
      expect(screen.getByText('旅のタイトルをつけよう')).toBeInTheDocument()
    })
  })

  describe('ステップ1: 日程入力', () => {
    function goToStep1() {
      render(<NewPlanPage />)
      fireEvent.change(screen.getByPlaceholderText('例: 夏の北海道3泊4日'), {
        target: { value: '沖縄旅行' },
      })
      fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
    }

    it('日程入力フォームを表示する', () => {
      goToStep1()
      expect(screen.getByText('日程を決めよう')).toBeInTheDocument()
      expect(screen.getByText(/出発日/)).toBeInTheDocument()
      expect(screen.getByText(/帰宅日/)).toBeInTheDocument()
    })

    it('日程が未入力の場合「しおりを作成」ボタンが無効になる', () => {
      goToStep1()
      const confirmButton = screen.getByRole('button', { name: /しおりを作成/ })
      expect(confirmButton).toBeDisabled()
    })

    it('出発日と帰宅日を入力すると「しおりを作成」ボタンが有効になる', () => {
      goToStep1()
      const dateInputs = screen.getAllByDisplayValue('')
      const departureInput = dateInputs.find(
        (el) => el.getAttribute('type') === 'date'
      ) as HTMLInputElement
      const returnInput = dateInputs.filter(
        (el) => el.getAttribute('type') === 'date'
      )[1] as HTMLInputElement

      fireEvent.change(departureInput, { target: { value: '2027-07-01' } })
      fireEvent.change(returnInput, { target: { value: '2027-07-03' } })

      const confirmButton = screen.getByRole('button', { name: /しおりを作成/ })
      expect(confirmButton).not.toBeDisabled()
    })
  })

  describe('ステップ2: しおり作成', () => {
    function goToStep2() {
      render(<NewPlanPage />)
      fireEvent.change(screen.getByPlaceholderText('例: 夏の北海道3泊4日'), {
        target: { value: '沖縄旅行' },
      })
      fireEvent.click(screen.getByRole('button', { name: /次へ/ }))

      const dateInputs = screen.getAllByDisplayValue('')
      const dates = dateInputs.filter((el) => el.getAttribute('type') === 'date')
      fireEvent.change(dates[0], { target: { value: '2027-07-01' } })
      fireEvent.change(dates[1], { target: { value: '2027-07-02' } })
      fireEvent.click(screen.getByRole('button', { name: /しおりを作成/ }))
    }

    it('しおり画面で「プランを保存する」ボタンが表示される', () => {
      goToStep2()
      expect(screen.getByRole('button', { name: /プランを保存する/ })).toBeInTheDocument()
    })

    it('日数分のDayセクションが表示される', () => {
      goToStep2()
      expect(screen.getByText(/Day 1/)).toBeInTheDocument()
      expect(screen.getByText(/Day 2/)).toBeInTheDocument()
    })

    it('「プランを保存する」をクリックするとsavePlanが呼ばれてマイプランに遷移する', async () => {
      const { savePlan } = await import('@/lib/storage')
      goToStep2()
      fireEvent.click(screen.getByRole('button', { name: /プランを保存する/ }))
      expect(savePlan).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/plans/my')
    })

    it('「スポットを追加」ボタンが各日に表示される', () => {
      goToStep2()
      const addButtons = screen.getAllByText(/スポットを追加/)
      expect(addButtons.length).toBe(2)
    })
  })
})
