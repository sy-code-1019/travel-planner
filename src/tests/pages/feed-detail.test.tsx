import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import FeedDetailPage from '@/app/feed/[id]/page'

// use(Promise) をテスト環境でSuspenseなしに解決するためにモック
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    use: (value: unknown) => {
      if (value && typeof (value as { then?: unknown }).then === 'function') {
        return { id: 'test-post-id' }
      }
      return (actual as { use: (v: unknown) => unknown }).use(value)
    },
  }
})
import { useAuth } from '@/lib/auth-context'
import { getDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'

const mockPush = vi.fn()

vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  increment: vi.fn((n: number) => n),
  arrayUnion: vi.fn((v: unknown) => v),
  arrayRemove: vi.fn((v: unknown) => v),
}))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/storage', () => ({
  savePlan: vi.fn((input: unknown) => ({ ...(input as object), id: 'new-plan-id', createdAt: '' })),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockUser = { uid: 'logged-in-user', displayName: 'テストユーザー' } as User

const basePost = {
  authorId: 'other-user',
  authorName: 'たろう',
  title: '京都旅行プラン',
  comment: '紅葉が最高でした',
  createdAt: Date.now(),
  likeCount: 10,
  likedBy: [] as string[],
  plan: {
    id: 'plan-x',
    mode: 'planned' as const,
    title: '京都旅行プラン',
    departureDate: '2026-11-01',
    departureTime: '09:00',
    returnDate: '2026-11-03',
    returnTime: '18:00',
    createdAt: '',
    itinerary: [
      {
        date: '2026-11-01',
        spots: [
          {
            id: 's1',
            place: '自宅',
            time: '09:00',
            transportation: '' as const,
            memo: '',
            isFixed: true,
          },
          {
            id: 's2',
            place: '金閣寺',
            time: '11:00',
            transportation: '電車・新幹線' as const,
            memo: '',
          },
          {
            id: 's3',
            place: '自宅',
            time: '20:00',
            transportation: '' as const,
            memo: '',
            isFixed: true,
          },
        ],
      },
    ],
  },
}

function setupPost(overrides: Partial<typeof basePost> = {}) {
  const postData = { ...basePost, ...overrides }
  vi.mocked(getDoc)
    .mockResolvedValueOnce({
      exists: () => true,
      id: 'test-post-id',
      data: () => postData,
    } as never)
    .mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ following: [], bookmarks: [] }),
    } as never)
}

function loggedOut() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  })
}

function loggedIn(user = mockUser) {
  vi.mocked(useAuth).mockReturnValue({
    user,
    loading: false,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  })
}

function renderDetail() {
  return render(<FeedDetailPage params={Promise.resolve({ id: 'test-post-id' })} />)
}

describe('FeedDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loggedOut()
  })

  describe('投稿コンテンツの表示', () => {
    beforeEach(() => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'test-post-id',
        data: () => basePost,
      } as never)
    })

    it('投稿のタイトルを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('京都旅行プラン')).toBeInTheDocument())
    })

    it('投稿者名を表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('たろう')).toBeInTheDocument())
    })

    it('コメントを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('紅葉が最高でした')).toBeInTheDocument())
    })

    it('日程スポットを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('金閣寺')).toBeInTheDocument())
    })

    it('いいね数を表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
    })

    it('存在しない投稿の場合「投稿が見つかりません」を表示する', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        id: 'none',
        data: () => null,
      } as never)
      renderDetail()
      await waitFor(() => expect(screen.getByText('投稿が見つかりません')).toBeInTheDocument())
    })
  })

  describe('未ログイン時の表示', () => {
    beforeEach(() => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'test-post-id',
        data: () => basePost,
      } as never)
    })

    it('いいねボタンがdisabledになっている', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('like-button')).toBeInTheDocument())
      expect(screen.getByTestId('like-button')).toBeDisabled()
    })

    it('「ログインするといいねできます」メッセージを表示する', async () => {
      renderDetail()
      await waitFor(() =>
        expect(screen.getByText('ログインするといいねできます')).toBeInTheDocument()
      )
    })

    it('フォローボタンを表示しない', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('京都旅行プラン')).toBeInTheDocument())
      expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument()
    })

    it('ブックマークボタンを表示しない', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('京都旅行プラン')).toBeInTheDocument())
      expect(screen.queryByTestId('bookmark-button')).not.toBeInTheDocument()
    })

    it('「コピーして使う」ボタンを表示しない', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('京都旅行プラン')).toBeInTheDocument())
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument()
    })
  })

  describe('ログイン時の表示（他ユーザーの投稿）', () => {
    beforeEach(() => {
      setupPost()
      loggedIn()
    })

    it('いいねボタンがenabledになっている', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('like-button')).toBeInTheDocument())
      expect(screen.getByTestId('like-button')).not.toBeDisabled()
    })

    it('フォローボタンを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('follow-button')).toBeInTheDocument())
    })

    it('フォローボタンのラベルは「フォロー」', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('follow-button')).toBeInTheDocument())
      expect(screen.getByTestId('follow-button').textContent).toContain('フォロー')
    })

    it('ブックマークボタンを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('bookmark-button')).toBeInTheDocument())
    })

    it('「コピーして使う」ボタンを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('copy-button')).toBeInTheDocument())
    })
  })

  describe('ログイン時の表示（自分の投稿）', () => {
    beforeEach(() => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'test-post-id',
        data: () => ({ ...basePost, authorId: mockUser.uid }),
      } as never)
      loggedIn()
    })

    it('フォローボタンを表示しない', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('京都旅行プラン')).toBeInTheDocument())
      expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument()
    })

    it('編集ボタンを表示する', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByText('京都旅行プラン')).toBeInTheDocument())
    })

    it('「コピーして使う」ボタンを表示する（自分の投稿でもコピー可能）', async () => {
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('copy-button')).toBeInTheDocument())
    })
  })

  describe('インタラクション', () => {
    it('「コピーして使う」クリックでプランを保存してeditページへ遷移する', async () => {
      const { savePlan } = await import('@/lib/storage')
      setupPost()
      loggedIn()
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('copy-button')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('copy-button'))

      expect(savePlan).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/plans/new-plan-id/edit')
    })

    it('いいねボタンをクリックするとupdateDocが呼ばれる', async () => {
      const { updateDoc } = await import('firebase/firestore')
      setupPost()
      loggedIn()
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('like-button')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('like-button'))

      await waitFor(() => expect(updateDoc).toHaveBeenCalled())
    })

    it('フォローボタンをクリックするとsetDocが呼ばれる', async () => {
      const { setDoc } = await import('firebase/firestore')
      setupPost()
      loggedIn()
      renderDetail()
      await waitFor(() => expect(screen.getByTestId('follow-button')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('follow-button'))

      await waitFor(() => expect(setDoc).toHaveBeenCalled())
    })
  })
})
