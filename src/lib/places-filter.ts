export const PURPOSE_KEYWORDS: Record<string, string[]> = {
  観光: ['観光スポット 名所', '神社 寺院', '城 歴史的建造物', '博物館 美術館'],
  グルメ: ['レストラン 名店', 'ラーメン 寿司 和食', 'カフェ スイーツ', '居酒屋 焼肉'],
  温泉: ['温泉 露天風呂', '温泉旅館 銭湯'],
  ドライブ: ['ドライブスポット 景勝地', '道の駅', '展望台'],
  景色: ['絶景 展望台', '夜景 サンセット', '自然 公園 花'],
  アクティビティ: ['アクティビティ 体験', 'アウトドア ハイキング', 'マリンスポーツ スキー'],
}

export const KEYWORD_TO_TYPES: Record<string, string[]> = {
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
  グルメ: ['restaurant', 'food', 'cafe', 'bakery', 'meal_takeaway', 'meal_delivery'],
  観光: [
    'tourist_attraction',
    'place_of_worship',
    'museum',
    'art_gallery',
    'amusement_park',
    'zoo',
    'aquarium',
    'stadium',
  ],
  景色: ['natural_feature', 'park'],
  アクティビティ: ['amusement_park', 'stadium', 'gym', 'aquarium', 'zoo'],
}

export interface PlaceCandidate {
  name: string
  types?: string[]
}

export function filterByRelevantTypes(
  places: PlaceCandidate[],
  purposes: string[]
): PlaceCandidate[] {
  const relevantTypes = purposes.flatMap((p) => KEYWORD_TO_TYPES[p] ?? [])
  if (relevantTypes.length === 0) return places
  return places.filter(
    (p) =>
      p.types?.some((t) => relevantTypes.includes(t)) || purposes.some((kw) => p.name.includes(kw))
  )
}
