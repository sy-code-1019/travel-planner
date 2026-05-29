import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import FeedPage from '@/app/feed/page'
import { useAuth } from '@/lib/auth-context'
import { getDocs, getDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'

vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
}))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockUser = { uid: 'user-1', displayName: 'テストユーザー' } as User

const mockPosts = [
  {
    id: 'post-1',
    authorId: 'user-2',
    authorName: 'やまだ',
    title: '沖縄旅行',
    comment: '海がきれいでした',
    createdAt: 2000,
    likeCount: 3,
    likedBy: [],
    plan: {
      id: 'plan-1',
      mode: 'planned',
      title: '沖縄旅行',
      departureDate: '2026-07-01',
      departureTime: '',
      returnDate: '2026-07-03',
      returnTime: '',
      createdAt: '',
      itinerary: [
        {
          date: '2026-07-01',
          spots: [
            { id: 's1', place: '那覇', time: '', transportation: '', memo: '', isFixed: false },
          ],
        },
      ],
    },
  },
  {
    id: 'post-2',
    authorId: 'user-1',
    authorName: 'テストユーザー',
    title: '北海道旅行',
    comment: '温泉が最高',
    createdAt: 1000,
    likeCount: 0,
    likedBy: [],
    plan: {
      id: 'plan-2',
      mode: 'planned',
      title: '北海道旅行',
      departureDate: '2026-08-01',
      departureTime: '',
      returnDate: '2026-08-03',
      returnTime: '',
      createdAt: '',
      itinerary: [
        {
          date: '2026-08-01',
          spots: [
            { id: 's2', place: '札幌', time: '', transportation: '', memo: '', isFixed: false },
          ],
        },
      ],
    },
  },
]

function setupGetDocs() {
  vi.mocked(getDocs).mockResolvedValue({
    docs: mockPosts.map((post) => ({
      id: post.id,
      data: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...rest } = post
        return rest
      },
    })),
  } as never)
}

function setupGetDoc(following: string[] = [], bookmarks: string[] = []) {
  vi.mocked(getDoc).mockResolvedValue({
    exists: () => true,
    data: () => ({ following, bookmarks }),
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

describe('FeedPage', () => {
  beforeEach(() => {
    setupGetDocs()
    loggedOut()
  })

  it('ロード中はスケルトンを表示する', () => {
    vi.mocked(getDocs).mockReturnValue(new Promise(() => {}) as never)
    render(<FeedPage />)
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('投稿一覧を表示する', async () => {
    render(<FeedPage />)
    await waitFor(() => {
      expect(screen.getByText('沖縄旅行')).toBeInTheDocument()
      expect(screen.getByText('北海道旅行')).toBeInTheDocument()
    })
  })

  it('投稿者名を表示する', async () => {
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('やまだ')).toBeInTheDocument())
  })

  it('いいね数を表示する', async () => {
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
  })

  it('未ログイン時はタブを表示しない', async () => {
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('沖縄旅行')).toBeInTheDocument())
    expect(screen.queryByText('フォロー中')).not.toBeInTheDocument()
    expect(screen.queryByText('自分の投稿')).not.toBeInTheDocument()
  })

  it('ログイン時はタブを表示する', async () => {
    setupGetDoc()
    loggedIn()
    render(<FeedPage />)
    await waitFor(() => {
      expect(screen.getByText('フォロー中')).toBeInTheDocument()
      expect(screen.getByText('自分の投稿')).toBeInTheDocument()
      expect(screen.getByText('ブックマーク')).toBeInTheDocument()
    })
  })

  it('検索でタイトルによるフィルタリングができる', async () => {
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('沖縄旅行')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('タイトル・行き先・投稿者で検索'), {
      target: { value: '沖縄' },
    })

    expect(screen.getByText('沖縄旅行')).toBeInTheDocument()
    expect(screen.queryByText('北海道旅行')).not.toBeInTheDocument()
  })

  it('検索で投稿者名によるフィルタリングができる', async () => {
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('沖縄旅行')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('タイトル・行き先・投稿者で検索'), {
      target: { value: 'やまだ' },
    })

    expect(screen.getByText('沖縄旅行')).toBeInTheDocument()
    expect(screen.queryByText('北海道旅行')).not.toBeInTheDocument()
  })

  it('該当なしの検索では「該当する投稿が見つかりません」を表示する', async () => {
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('沖縄旅行')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('タイトル・行き先・投稿者で検索'), {
      target: { value: '存在しないキーワードxyz123' },
    })

    expect(screen.getByText('該当する投稿が見つかりません')).toBeInTheDocument()
  })

  it('「自分の投稿」タブで自分の投稿のみ表示する', async () => {
    setupGetDoc()
    loggedIn()
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('沖縄旅行')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('tab-mine'))

    expect(screen.getByText('北海道旅行')).toBeInTheDocument()
    expect(screen.queryByText('沖縄旅行')).not.toBeInTheDocument()
  })

  it('「ブックマーク」タブでブックマーク済み投稿のみ表示する', async () => {
    setupGetDoc([], ['post-1'])
    loggedIn()
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('沖縄旅行')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('tab-bookmarks'))

    expect(screen.getByText('沖縄旅行')).toBeInTheDocument()
    expect(screen.queryByText('北海道旅行')).not.toBeInTheDocument()
  })

  it('投稿が0件の場合「まだ投稿がありません」を表示する', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never)
    render(<FeedPage />)
    await waitFor(() => expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument())
  })
})
