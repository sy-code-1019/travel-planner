import { NextResponse } from 'next/server'

const PURPOSE_KEYWORDS: Record<string, string> = {
  観光: '観光スポット 名所',
  グルメ: 'グルメ レストラン 名店',
  温泉: '温泉',
  ドライブ: 'ドライブスポット 景勝地',
  景色: '絶景 展望台',
  アクティビティ: 'アクティビティ 体験',
}

interface GooglePlace {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  vicinity?: string
  formatted_address?: string
  types?: string[]
}

async function geocodePrefecture(
  prefecture: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(prefecture + '日本')}&language=ja&key=${apiKey}`
    const res = await fetch(url)
    const data = (await res.json()) as {
      results?: { geometry: { location: { lat: number; lng: number } } }[]
    }
    return data.results?.[0]?.geometry?.location ?? null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prefecture = searchParams.get('prefecture') ?? ''
  const purposes = (searchParams.get('purposes') ?? '').split(',').filter(Boolean)

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // 都道府県の中心座標を取得して検索エリアを地理的に絞り込む
  const location = await geocodePrefecture(prefecture, apiKey)
  const locationParam = location ? `&location=${location.lat},${location.lng}&radius=150000` : ''

  // locationが取れた場合はクエリから都道府県名を除く（名前一致の誤ヒットを防ぐ）
  const buildQuery = (keyword: string) => (location ? keyword : `${prefecture} ${keyword}`)

  const queries =
    purposes.length > 0
      ? purposes.map((p) => buildQuery(PURPOSE_KEYWORDS[p] ?? p))
      : [buildQuery('観光スポット')]

  const allResults: GooglePlace[] = []

  for (const query of queries) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja${locationParam}&key=${apiKey}`
      const res = await fetch(url)
      const data = (await res.json()) as { results?: GooglePlace[] }
      allResults.push(...(data.results ?? []))
    } catch {
      // 1つのクエリが失敗しても他の結果は返す
    }
  }

  // place_idで重複除去
  const seen = new Set<string>()
  const unique = allResults.filter((p) => {
    if (seen.has(p.place_id)) return false
    seen.add(p.place_id)
    return true
  })

  // formatted_addressに都道府県名が含まれるもののみ残す（locationがある場合）
  const prefShort = prefecture.replace(/[都道府県]$/, '')
  const inPrefecture = location
    ? unique.filter((p) => {
        const addr = (p.formatted_address ?? p.vicinity ?? '').replace(/〒\d{3}-\d{4}\s*/, '')
        return addr.includes(prefecture) || addr.includes(prefShort)
      })
    : unique

  // 評価3以上でフィルタしてスコア順にソート
  const spots = inPrefecture
    .filter((p) => (p.rating ?? 0) >= 3)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map((p) => ({
      name: p.name,
      description: p.formatted_address ?? p.vicinity ?? '',
      rating: p.rating ?? 0,
      ratingsTotal: p.user_ratings_total ?? 0,
    }))

  return NextResponse.json({ spots })
}
