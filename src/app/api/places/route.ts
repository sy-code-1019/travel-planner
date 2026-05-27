import { NextResponse } from 'next/server'

const PURPOSE_KEYWORDS: Record<string, string[]> = {
  観光: ['観光スポット 名所', '神社 寺院', '城 歴史的建造物', '博物館 美術館'],
  グルメ: ['レストラン 名店', 'ラーメン 寿司 和食', 'カフェ スイーツ', '居酒屋 焼肉'],
  温泉: ['温泉 露天風呂', '温泉旅館 銭湯'],
  ドライブ: ['ドライブスポット 景勝地', '道の駅', '展望台'],
  景色: ['絶景 展望台', '夜景 サンセット', '自然 公園 花'],
  アクティビティ: ['アクティビティ 体験', 'アウトドア ハイキング', 'マリンスポーツ スキー'],
}

// キーワードに対応するGoogle Place types（後処理フィルタ用）
const KEYWORD_TO_TYPES: Record<string, string[]> = {
  水族館: ['aquarium'],
  動物園: ['zoo'],
  公園: ['park'],
  博物館: ['museum'],
  美術館: ['art_gallery', 'museum'],
  遊園地: ['amusement_park'],
  神社: ['place_of_worship'],
  寺院: ['place_of_worship'],
  映画館: ['movie_theater'],
  図書館: ['library'],
  カフェ: ['cafe'],
  レストラン: ['restaurant', 'food'],
  ホテル: ['lodging'],
  温泉: ['spa', 'lodging'],
  サウナ: ['spa'],
  ビーチ: ['natural_feature'],
  海: ['natural_feature'],
  山: ['natural_feature'],
}

interface GooglePlace {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  vicinity?: string
  formatted_address?: string
  types?: string[]
  photos?: { photo_reference: string }[]
}

interface PlacesResponse {
  results?: GooglePlace[]
  next_page_token?: string
}

async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ' 日本')}&language=ja&key=${apiKey}`
    const res = await fetch(url)
    const data = (await res.json()) as {
      results?: { geometry: { location: { lat: number; lng: number } } }[]
    }
    return data.results?.[0]?.geometry?.location ?? null
  } catch {
    return null
  }
}

// Google Places を最大3ページ（60件）取得する
// Google の仕様上、ページ間に2秒の待機が必要
async function fetchAllPages(initialUrl: string, apiKey: string): Promise<GooglePlace[]> {
  const results: GooglePlace[] = []

  const res = await fetch(initialUrl)
  const data = (await res.json()) as PlacesResponse
  results.push(...(data.results ?? []))

  let nextPageToken = data.next_page_token ?? ''
  let page = 1

  while (nextPageToken && page < 3) {
    await new Promise((r) => setTimeout(r, 2000))
    const pageRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
    )
    const pageData = (await pageRes.json()) as PlacesResponse
    results.push(...(pageData.results ?? []))
    nextPageToken = pageData.next_page_token ?? ''
    page++
  }

  return results
}

// 地方ごとの代表都市（ジオコード精度向上のため）
const REGION_CENTERS: Record<string, string> = {
  '北海道・東北': '仙台市',
  関東: '東京',
  '中部・北陸': '名古屋市',
  近畿: '大阪市',
  '中国・四国': '広島市',
  '九州・沖縄': '福岡市',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const area = searchParams.get('area') ?? ''
  const region = searchParams.get('region') ?? ''
  const purposes = (searchParams.get('purposes') ?? '').split(',').filter(Boolean)

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // area（市区町村）優先、なければ region（地方）を使う
  let location: { lat: number; lng: number } | null = null
  let radius = 25000
  let addressFilter: string | null = null

  if (area) {
    location = await geocodeAddress(area, apiKey)
    radius = 25000
    addressFilter = area
  } else if (region) {
    const center = REGION_CENTERS[region] ?? region
    location = await geocodeAddress(center, apiKey)
    radius = 200000 // 地方レベルは200km圏
    addressFilter = null // 地方は住所フィルタ不要（半径で絞る）
  }

  const locationParam = location ? `&location=${location.lat},${location.lng}&radius=${radius}` : ''

  const buildQuery = (keyword: string) => {
    if (location) return keyword // 座標で絞るのでキーワードのみ（エリア名を混ぜない）
    if (area) return `${area} ${keyword}` // ジオコード失敗時のフォールバック
    if (region) return `${region} ${keyword}`
    return `日本 ${keyword}`
  }

  const queries =
    purposes.length > 0
      ? purposes.flatMap((p) => {
          const keywords = PURPOSE_KEYWORDS[p]
          return keywords ? keywords.map((kw) => buildQuery(kw)) : [buildQuery(p)]
        })
      : [buildQuery('観光スポット'), buildQuery('名所'), buildQuery('神社 寺院')]

  // 複数クエリを並列実行（各クエリは最大3ページ×20件=60件）
  const queryResults = await Promise.all(
    queries.map((query) => {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja${locationParam}&key=${apiKey}`
      return fetchAllPages(url, apiKey).catch(() => [] as GooglePlace[])
    })
  )
  const allResults = queryResults.flat()

  // place_idで重複除去
  const seen = new Set<string>()
  const unique = allResults.filter((p) => {
    if (seen.has(p.place_id)) return false
    seen.add(p.place_id)
    return true
  })

  // 市区町村指定かつジオコード成功時のみ住所フィルタ
  const addressFiltered =
    addressFilter && location
      ? unique.filter((p) => {
          const addr = (p.formatted_address ?? p.vicinity ?? '').replace(/〒\d{3}-\d{4}\s*/, '')
          return addr.includes(addressFilter!)
        })
      : unique

  // キーワードに対応するPlace typeが存在する場合、タイプまたは名前で絞り込む
  // （Google Text SearchはレビューもHitするため無関係な場所が混入するのを防ぐ）
  const relevantTypes = purposes.flatMap((p) => KEYWORD_TO_TYPES[p] ?? [])
  const filtered =
    relevantTypes.length > 0
      ? addressFiltered.filter(
          (p) =>
            p.types?.some((t) => relevantTypes.includes(t)) ||
            purposes.some((kw) => p.name.includes(kw))
        )
      : addressFiltered

  const spots = filtered
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map((p) => ({
      name: p.name,
      description: p.formatted_address ?? p.vicinity ?? '',
      rating: p.rating ?? 0,
      ratingsTotal: p.user_ratings_total ?? 0,
      photoRef: p.photos?.[0]?.photo_reference ?? null,
    }))

  return NextResponse.json({ spots })
}
