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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prefecture = searchParams.get('prefecture') ?? ''
  const purposes = (searchParams.get('purposes') ?? '').split(',').filter(Boolean)

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const queries =
    purposes.length > 0
      ? purposes.map((p) => `${prefecture} ${PURPOSE_KEYWORDS[p] ?? p}`)
      : [`${prefecture} 観光スポット`]

  const allResults: GooglePlace[] = []

  for (const query of queries) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&key=${apiKey}`
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

  // 評価3以上でフィルタしてスコア順にソート
  const spots = unique
    .filter((p) => (p.rating ?? 0) >= 3)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map((p) => ({
      name: p.name,
      description: p.vicinity ?? p.formatted_address ?? '',
      rating: p.rating ?? 0,
      ratingsTotal: p.user_ratings_total ?? 0,
    }))

  return NextResponse.json({ spots })
}
