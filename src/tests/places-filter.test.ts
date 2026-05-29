import { describe, it, expect } from 'vitest'
import { filterByRelevantTypes } from '@/lib/places-filter'

describe('filterByRelevantTypes', () => {
  it('purposesが空の場合は全件そのまま返す', () => {
    const places = [
      { name: '居酒屋A', types: ['bar'] },
      { name: '公園B', types: ['park'] },
    ]
    expect(filterByRelevantTypes(places, [])).toHaveLength(2)
  })

  it('グルメ: restaurantタイプの場所を通す', () => {
    const places = [
      { name: '鮨 なかむら', types: ['restaurant', 'food', 'establishment'] },
      { name: 'シーシャカフェX', types: ['bar', 'night_club', 'establishment'] },
    ]
    const result = filterByRelevantTypes(places, ['グルメ'])
    expect(result.map((p) => p.name)).toContain('鮨 なかむら')
    expect(result.map((p) => p.name)).not.toContain('シーシャカフェX')
  })

  it('グルメ: cafeタイプの場所を通す', () => {
    const places = [{ name: 'スタバ', types: ['cafe', 'establishment'] }]
    const result = filterByRelevantTypes(places, ['グルメ'])
    expect(result).toHaveLength(1)
  })

  it('観光: place_of_worshipタイプの場所を通す', () => {
    const places = [
      { name: '浅草寺', types: ['place_of_worship', 'tourist_attraction'] },
      { name: 'コンビニ', types: ['convenience_store'] },
    ]
    const result = filterByRelevantTypes(places, ['観光'])
    expect(result.map((p) => p.name)).toContain('浅草寺')
    expect(result.map((p) => p.name)).not.toContain('コンビニ')
  })

  it('温泉: spaタイプまたはlodgingタイプの場所を通す', () => {
    const places = [
      { name: '箱根温泉旅館', types: ['lodging', 'spa'] },
      { name: 'ファミレス', types: ['restaurant'] },
    ]
    const result = filterByRelevantTypes(places, ['温泉'])
    expect(result.map((p) => p.name)).toContain('箱根温泉旅館')
    expect(result.map((p) => p.name)).not.toContain('ファミレス')
  })

  it('purposesに含まれるキーワードが名前に含まれる場合はtypeがなくても通す', () => {
    const places = [{ name: 'グルメ横丁', types: ['establishment'] }]
    const result = filterByRelevantTypes(places, ['グルメ'])
    expect(result).toHaveLength(1)
  })

  it('複数purposesの場合いずれかにマッチすれば通す', () => {
    const places = [
      { name: '旅館A', types: ['lodging'] },
      { name: 'レストランB', types: ['restaurant'] },
      { name: 'パチンコ', types: ['casino'] },
    ]
    const result = filterByRelevantTypes(places, ['温泉', 'グルメ'])
    expect(result).toHaveLength(2)
    expect(result.map((p) => p.name)).not.toContain('パチンコ')
  })
})
