import type { TravelPurpose } from '@/types/plan'

export interface RecommendedSpot {
  name: string
  description: string
  purposes: TravelPurpose[]
  suggestedTime: string
}

export const REGIONS: Record<string, string[]> = {
  '北海道・東北': ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  関東: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部・北陸': [
    '新潟県',
    '富山県',
    '石川県',
    '福井県',
    '山梨県',
    '長野県',
    '岐阜県',
    '静岡県',
    '愛知県',
  ],
  近畿: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国・四国': [
    '鳥取県',
    '島根県',
    '岡山県',
    '広島県',
    '山口県',
    '徳島県',
    '香川県',
    '愛媛県',
    '高知県',
  ],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
}

export const RECOMMENDATIONS: Record<string, RecommendedSpot[]> = {
  北海道: [
    {
      name: '函館山展望台',
      description: '日本三大夜景のひとつ。夜景と海峡の絶景',
      purposes: ['景色', '観光'],
      suggestedTime: '2時間',
    },
    {
      name: '小樽運河',
      description: 'レトロな倉庫群と運河が続くフォトスポット',
      purposes: ['観光', '景色'],
      suggestedTime: '1.5時間',
    },
    {
      name: '登別温泉',
      description: '硫黄泉・鉄泉など9種の泉質が楽しめる名湯',
      purposes: ['温泉'],
      suggestedTime: '半日〜1日',
    },
    {
      name: 'すすきの（札幌）',
      description: '北海道のグルメが集まる繁華街。海鮮・ラーメン',
      purposes: ['グルメ'],
      suggestedTime: '2〜3時間',
    },
    {
      name: 'ニセコアドベンチャーセンター',
      description: 'ラフティング・スキーなどアウトドア体験の拠点',
      purposes: ['アクティビティ'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '知床五湖',
      description: '世界遺産・知床の原生林と湖が織りなす絶景',
      purposes: ['景色', 'アクティビティ'],
      suggestedTime: '2〜3時間',
    },
  ],
  青森県: [
    {
      name: '奥入瀬渓流',
      description: '苔むす岩と清流が続く東北屈指の渓谷美',
      purposes: ['景色', 'アクティビティ'],
      suggestedTime: '3〜4時間',
    },
    {
      name: '十和田湖',
      description: 'カルデラ湖と紅葉が美しい高原の湖',
      purposes: ['景色', '観光'],
      suggestedTime: '2時間',
    },
    {
      name: '八甲田山',
      description: '樹氷とトレッキングで有名な活火山',
      purposes: ['景色', 'アクティビティ'],
      suggestedTime: '半日',
    },
    {
      name: '青森のっけ丼（古川市場）',
      description: '好みの海鮮をのせる青森名物の海鮮丼',
      purposes: ['グルメ'],
      suggestedTime: '1時間',
    },
    {
      name: '酸ヶ湯温泉',
      description: '日本最大級のヒバ千人風呂がある秘湯',
      purposes: ['温泉'],
      suggestedTime: '2〜3時間',
    },
  ],
  宮城県: [
    {
      name: '松島',
      description: '日本三景のひとつ。260余りの島が浮かぶ絶景',
      purposes: ['景色', '観光'],
      suggestedTime: '3時間',
    },
    {
      name: '仙台牛タン通り',
      description: '仙台名物の厚切り牛タンを食べ歩き',
      purposes: ['グルメ'],
      suggestedTime: '1〜2時間',
    },
    {
      name: '鳴子温泉郷',
      description: '東北有数の温泉地。こけし発祥の地',
      purposes: ['温泉', '観光'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '蔵王のお釜',
      description: 'エメラルドグリーンの火口湖と壮大な絶景',
      purposes: ['景色', 'ドライブ'],
      suggestedTime: '2時間',
    },
  ],
  東京都: [
    {
      name: '浅草・仲見世通り',
      description: '雷門と仲見世。江戸情緒あふれる下町観光',
      purposes: ['観光', 'グルメ'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '渋谷スクランブル交差点',
      description: '世界一の人通りを体感できる東京のシンボル',
      purposes: ['観光'],
      suggestedTime: '1時間',
    },
    {
      name: '新宿御苑',
      description: '都心にある四季折々の庭園。桜の名所',
      purposes: ['景色', '観光'],
      suggestedTime: '2時間',
    },
    {
      name: '築地場外市場',
      description: '新鮮な海鮮グルメと食材が揃う市場',
      purposes: ['グルメ'],
      suggestedTime: '2時間',
    },
    {
      name: '高尾山',
      description: 'ケーブルカーでも登れる人気の低山ハイキング',
      purposes: ['アクティビティ', '景色'],
      suggestedTime: '半日',
    },
  ],
  神奈川県: [
    {
      name: '鎌倉大仏・長谷寺',
      description: '高徳院の大仏と花の寺・長谷寺をめぐる',
      purposes: ['観光', '景色'],
      suggestedTime: '3時間',
    },
    {
      name: '箱根温泉',
      description: '富士山を望む絶景温泉リゾート',
      purposes: ['温泉', '景色'],
      suggestedTime: '1日〜',
    },
    {
      name: '江の島',
      description: '洞窟・展望台・海鮮グルメが楽しめる島',
      purposes: ['観光', 'グルメ', '景色'],
      suggestedTime: '3〜4時間',
    },
    {
      name: '横浜中華街',
      description: '日本最大の中華街。食べ歩きが充実',
      purposes: ['グルメ'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '芦ノ湖ドライブ',
      description: '富士山と湖を望む箱根のドライブコース',
      purposes: ['ドライブ', '景色'],
      suggestedTime: '半日',
    },
  ],
  長野県: [
    {
      name: '上高地',
      description: '日本アルプスの玄関口。梓川と穂高連峰の絶景',
      purposes: ['景色', 'アクティビティ'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '白骨温泉',
      description: '乳白色の湯で知られる秘湯。深い山中に位置する',
      purposes: ['温泉'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '松本城',
      description: '国宝の黒い天守が美しい戦国期の城郭',
      purposes: ['観光'],
      suggestedTime: '2時間',
    },
    {
      name: 'ビーナスライン',
      description: '蓼科から美ヶ原へ続く高原のドライブルート',
      purposes: ['ドライブ', '景色'],
      suggestedTime: '半日',
    },
    {
      name: '野沢温泉',
      description: '野沢菜発祥の地。外湯めぐりが楽しい温泉地',
      purposes: ['温泉'],
      suggestedTime: '半日',
    },
  ],
  静岡県: [
    {
      name: '富士山（富士宮口）',
      description: '日本最高峰。登山・五合目観光が人気',
      purposes: ['景色', 'アクティビティ'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '熱海温泉',
      description: '東京から近い温泉リゾート。海沿いの眺望も◎',
      purposes: ['温泉', '景色'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '伊豆半島ドライブ',
      description: '海岸線を走る絶景ドライブコース',
      purposes: ['ドライブ', '景色'],
      suggestedTime: '半日〜1日',
    },
    {
      name: 'さわやかハンバーグ',
      description: '静岡県民が愛するげんこつハンバーグの名店',
      purposes: ['グルメ'],
      suggestedTime: '1〜2時間',
    },
  ],
  京都府: [
    {
      name: '伏見稲荷大社',
      description: '千本鳥居が続く朱色の神社。外国人人気No.1',
      purposes: ['観光', '景色'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '嵐山・竹林の道',
      description: '大きな竹林のトンネルと桂川の絶景',
      purposes: ['景色', '観光'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '錦市場',
      description: '京の台所。漬物・豆腐・和菓子の食べ歩き',
      purposes: ['グルメ'],
      suggestedTime: '1〜2時間',
    },
    {
      name: '貴船神社',
      description: '緑の中に浮かぶ朱の灯籠と川床料理が有名',
      purposes: ['観光', 'グルメ', '景色'],
      suggestedTime: '2時間',
    },
    {
      name: '金閣寺・銀閣寺',
      description: '世界遺産の金・銀の舎利殿をめぐる',
      purposes: ['観光'],
      suggestedTime: '3時間',
    },
  ],
  大阪府: [
    {
      name: '道頓堀',
      description: 'たこ焼き・串カツ・お好み焼きの聖地',
      purposes: ['グルメ', '観光'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '大阪城公園',
      description: '豊臣秀吉ゆかりの城と広大な公園',
      purposes: ['観光', '景色'],
      suggestedTime: '2時間',
    },
    {
      name: 'ユニバーサル・スタジオ・ジャパン',
      description: '世界的テーマパーク。アトラクションが充実',
      purposes: ['アクティビティ'],
      suggestedTime: '1日',
    },
    {
      name: '黒門市場',
      description: '大阪の台所。新鮮な海鮮グルメが楽しめる',
      purposes: ['グルメ'],
      suggestedTime: '1〜2時間',
    },
  ],
  兵庫県: [
    {
      name: '姫路城',
      description: '白鷺城とも呼ばれる国宝・世界遺産の城',
      purposes: ['観光'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '有馬温泉',
      description: '日本最古の温泉地のひとつ。金泉・銀泉が有名',
      purposes: ['温泉'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '城崎温泉',
      description: '外湯めぐりが楽しい山陰の風情ある温泉街',
      purposes: ['温泉', '観光'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '神戸ハーバーランド',
      description: '海沿いのモダンな観光エリア。グルメも豊富',
      purposes: ['観光', 'グルメ', '景色'],
      suggestedTime: '2〜3時間',
    },
  ],
  広島県: [
    {
      name: '宮島・厳島神社',
      description: '世界遺産。海に浮かぶ大鳥居が絶景',
      purposes: ['観光', '景色'],
      suggestedTime: '3〜4時間',
    },
    {
      name: '原爆ドーム・平和記念公園',
      description: '世界遺産の被爆建物と平和を祈る公園',
      purposes: ['観光'],
      suggestedTime: '2〜3時間',
    },
    {
      name: 'お好み村（広島風お好み焼き）',
      description: '広島名物の重ね焼きスタイルのお好み焼き',
      purposes: ['グルメ'],
      suggestedTime: '1〜2時間',
    },
    {
      name: 'しまなみ海道サイクリング',
      description: '瀬戸内海の島々を橋で結ぶ絶景サイクリングロード',
      purposes: ['アクティビティ', '景色', 'ドライブ'],
      suggestedTime: '1日',
    },
  ],
  福岡県: [
    {
      name: '太宰府天満宮',
      description: '学問の神様・菅原道真を祀る全国屈指の神社',
      purposes: ['観光'],
      suggestedTime: '2時間',
    },
    {
      name: '中洲屋台',
      description: '福岡名物のラーメン・もつ鍋・おでんの屋台群',
      purposes: ['グルメ'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '糸島ドライブ',
      description: '海沿いのカフェとビーチが続く絶景ドライブ',
      purposes: ['ドライブ', '景色', 'グルメ'],
      suggestedTime: '半日',
    },
    {
      name: '博多・キャナルシティ',
      description: '運河が流れるショッピング・グルメ複合施設',
      purposes: ['グルメ', '観光'],
      suggestedTime: '2〜3時間',
    },
  ],
  長崎県: [
    {
      name: 'グラバー園・大浦天主堂',
      description: '世界遺産の教会と開国の面影が残る洋館群',
      purposes: ['観光'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '稲佐山展望台',
      description: '世界三大夜景・長崎の夜景を一望できる山',
      purposes: ['景色'],
      suggestedTime: '1〜2時間',
    },
    {
      name: 'ちゃんぽん・皿うどん',
      description: '長崎を代表するソウルフード',
      purposes: ['グルメ'],
      suggestedTime: '1時間',
    },
    {
      name: '雲仙温泉',
      description: '地獄と呼ばれる噴気地帯が広がる温泉地',
      purposes: ['温泉', '景色'],
      suggestedTime: '半日〜1日',
    },
  ],
  熊本県: [
    {
      name: '阿蘇山',
      description: '世界最大級のカルデラと草千里の大草原',
      purposes: ['景色', 'ドライブ', 'アクティビティ'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '熊本城',
      description: '難攻不落で知られる国内最大級の城郭',
      purposes: ['観光'],
      suggestedTime: '2〜3時間',
    },
    {
      name: '黒川温泉',
      description: '山里の情緒あふれる露天風呂めぐりが人気',
      purposes: ['温泉'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '馬刺し・辛子蓮根',
      description: '熊本名物の馬刺しと辛子蓮根を味わう',
      purposes: ['グルメ'],
      suggestedTime: '1〜2時間',
    },
  ],
  沖縄県: [
    {
      name: '美ら海水族館',
      description: 'ジンベエザメと泳ぐ巨大水槽が圧巻の水族館',
      purposes: ['観光', 'アクティビティ'],
      suggestedTime: '3〜4時間',
    },
    {
      name: '首里城',
      description: '琉球王国の歴史を伝える世界遺産',
      purposes: ['観光'],
      suggestedTime: '2時間',
    },
    {
      name: '古宇利島ドライブ',
      description: '青い海に架かる橋を渡るドライブコース',
      purposes: ['ドライブ', '景色'],
      suggestedTime: '2〜3時間',
    },
    {
      name: 'シュノーケリング（慶良間諸島）',
      description: '透明度抜群のサンゴ礁でウミガメと泳ぐ',
      purposes: ['アクティビティ', '景色'],
      suggestedTime: '半日〜1日',
    },
    {
      name: '国際通り（那覇）',
      description: '沖縄グルメ・土産が揃うメインストリート',
      purposes: ['グルメ', '観光'],
      suggestedTime: '2〜3時間',
    },
  ],
}

export function getRecommendations(
  prefecture: string,
  purposes: TravelPurpose[]
): RecommendedSpot[] {
  // フルネーム → 末尾の都道府県を除いたキーの順で検索
  const all =
    RECOMMENDATIONS[prefecture] ?? RECOMMENDATIONS[prefecture.replace(/[都道府県]$/, '')] ?? []
  if (purposes.length === 0) return all
  // 選んだ目的に一致するスポットを優先表示
  const matched = all.filter((s) => s.purposes.some((p) => purposes.includes(p)))
  return matched.length > 0 ? matched : all
}
