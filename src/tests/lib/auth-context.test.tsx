import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'

let authStateCallback: (user: unknown) => void = () => {}

vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (u: unknown) => void) => {
    authStateCallback = cb
    return vi.fn()
  }),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}))

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { getDocs, setDoc } from 'firebase/firestore'

function StateView() {
  const { user, loading } = useAuth()
  return (
    <div data-testid="state">
      {loading ? 'loading' : user ? `uid:${(user as { uid: string }).uid}` : 'no-user'}
    </div>
  )
}

async function extractHook<T>(getter: (ctx: ReturnType<typeof useAuth>) => T): Promise<T> {
  let value: T
  function Extractor() {
    const ctx = useAuth()
    React.useEffect(() => {
      value = getter(ctx)
    })
    return null
  }
  render(
    <AuthProvider>
      <Extractor />
    </AuthProvider>
  )
  await act(async () => {
    authStateCallback(null)
  })
  return value!
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    authStateCallback = () => {}
    vi.clearAllMocks()
  })

  it('AuthProvider外でuseAuthを呼ぶと例外をthrowする', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<StateView />)).toThrow('useAuth must be used within AuthProvider')
    spy.mockRestore()
  })

  it('初期状態はloading=true', () => {
    render(
      <AuthProvider>
        <StateView />
      </AuthProvider>
    )
    expect(screen.getByTestId('state').textContent).toBe('loading')
  })

  it('onAuthStateChangedがnullを返すとuser=nullになる', async () => {
    render(
      <AuthProvider>
        <StateView />
      </AuthProvider>
    )
    await act(async () => {
      authStateCallback(null)
    })
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('no-user'))
  })

  it('onAuthStateChangedがユーザーを返すとuserが設定される', async () => {
    render(
      <AuthProvider>
        <StateView />
      </AuthProvider>
    )
    await act(async () => {
      authStateCallback({ uid: 'user-123', displayName: 'テスト' })
    })
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('uid:user-123'))
  })

  it('signup: displayNameが重複している場合auth/display-name-takenをthrow', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ empty: false, docs: [{}] } as never)
    const signup = await extractHook((ctx) => ctx.signup)
    await expect(signup('a@test.com', 'pass123', '重複名')).rejects.toMatchObject({
      code: 'auth/display-name-taken',
    })
  })

  it('signup: 新規ユーザーを作成してFirestoreにプロフィールを書き込む', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ empty: true, docs: [] } as never)
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
      user: { uid: 'new-uid', displayName: null },
    } as never)
    vi.mocked(updateProfile).mockResolvedValueOnce(undefined)
    vi.mocked(setDoc).mockResolvedValueOnce(undefined)

    const signup = await extractHook((ctx) => ctx.signup)
    await signup('new@test.com', 'password123', '新ユーザー')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'new@test.com',
      'password123'
    )
    expect(setDoc).toHaveBeenCalled()
  })

  it('login: signInWithEmailAndPasswordを正しい引数で呼ぶ', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({} as never)
    const login = await extractHook((ctx) => ctx.login)
    await login('test@test.com', 'mypassword')
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@test.com',
      'mypassword'
    )
  })

  it('logout: signOutを呼ぶ', async () => {
    vi.mocked(signOut).mockResolvedValueOnce(undefined)
    const logout = await extractHook((ctx) => ctx.logout)
    await logout()
    expect(signOut).toHaveBeenCalled()
  })
})
