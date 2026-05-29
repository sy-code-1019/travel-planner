import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/places/route'

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        status: (init as { status?: number })?.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}))

const mockPlaces = [
  {
    place_id: 'p1',
    name: '老舗ラーメン',
    rating: 4.5,
    user_ratings_total: 200,
    formatted_address: '埼玉県さいたま市大宮区',
    types: ['restaurant', 'food'],
    photos: [{ photo_reference: 'ref1' }],
  },
  {
    place_id: 'p2',
    name: 'シーシャラウンジ',
    rating: 4.0,
    user_ratings_total: 80,
    formatted_address: '埼玉県さいたま市大宮区',
    types: ['bar', 'night_club'],
  },
  {
    place_id: 'p3',
    name: 'スタバ大宮店',
    rating: 3.8,
    user_ratings_total: 300,
    formatted_address: '埼玉県さいたま市大宮区',
    types: ['cafe', 'food'],
  },
]

function makeFetchMock() {
  return vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
    if (String(url).includes('geocode')) {
      return new Response(
        JSON.stringify({ results: [{ geometry: { location: { lat: 35.9, lng: 139.6 } } }] }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    return new Response(JSON.stringify({ results: mockPlaces }), {
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

describe('GET /api/places', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key')
    makeFetchMock()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('APIキーが未設定の場合は500を返す', async () => {
    vi.stubEnv('GOOGLE_PLACES_API_KEY', '')
    const res = await GET(new Request('http://localhost/api/places?purposes=グルメ&area=大宮'))
    expect(res.status).toBe(500)
    const data = (await res.json()) as { error: string }
    expect(data.error).toBeTruthy()
  })

  it('spots配列をJSONで返す', async () => {
    const res = await GET(new Request('http://localhost/api/places?purposes=グルメ&area=大宮'))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { spots: unknown[] }
    expect(Array.isArray(data.spots)).toBe(true)
  })

  it('ratingの高い順にソートされる', async () => {
    const res = await GET(new Request('http://localhost/api/places?purposes=グルメ&area=大宮'))
    const data = (await res.json()) as { spots: { rating: number }[] }
    for (let i = 0; i < data.spots.length - 1; i++) {
      expect(data.spots[i].rating).toBeGreaterThanOrEqual(data.spots[i + 1].rating)
    }
  })

  it('グルメ検索でbar/night_clubタイプが除外される', async () => {
    const res = await GET(new Request('http://localhost/api/places?purposes=グルメ&area=大宮'))
    const data = (await res.json()) as { spots: { name: string }[] }
    const names = data.spots.map((s) => s.name)
    expect(names).not.toContain('シーシャラウンジ')
    expect(names).toContain('老舗ラーメン')
    expect(names).toContain('スタバ大宮店')
  })

  it('エリア指定時にジオコードAPIが呼ばれる', async () => {
    await GET(new Request('http://localhost/api/places?purposes=グルメ&area=大宮'))
    const geocodeCalled = vi
      .mocked(global.fetch)
      .mock.calls.some(([url]) => String(url).includes('geocode'))
    expect(geocodeCalled).toBe(true)
  })

  it('ジオコード失敗時も正常にレスポンスを返す', async () => {
    vi.restoreAllMocks()
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('geocode')) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ results: mockPlaces }), {
        headers: { 'Content-Type': 'application/json' },
      })
    })
    const res = await GET(
      new Request('http://localhost/api/places?purposes=グルメ&area=不明な場所')
    )
    expect(res.status).toBe(200)
  })

  it('purposesもエリアも未指定でデフォルト観光スポット検索が動作する', async () => {
    const res = await GET(new Request('http://localhost/api/places'))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { spots: unknown[] }
    expect(Array.isArray(data.spots)).toBe(true)
  })

  it('spotsにname・rating・photoRefが含まれる', async () => {
    const res = await GET(new Request('http://localhost/api/places?purposes=グルメ&area=大宮'))
    const data = (await res.json()) as {
      spots: { name: string; rating: number; photoRef: string | null }[]
    }
    const spot = data.spots.find((s) => s.name === '老舗ラーメン')
    expect(spot).toBeDefined()
    expect(typeof spot!.rating).toBe('number')
    expect(spot!.photoRef).toBe('ref1')
  })
})
