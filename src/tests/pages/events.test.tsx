import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import EventsPage from '@/app/events/page'
import { JAPAN_EVENTS } from '@/data/events'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

function getCurrentMonth() {
  return new Date().getMonth() + 1
}

function getNextMonth() {
  const m = getCurrentMonth()
  return m === 12 ? 1 : m + 1
}

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ページタイトル「今月・来月のイベント」を表示する', () => {
    render(<EventsPage />)
    expect(screen.getByText('今月・来月のイベント')).toBeInTheDocument()
  })

  it('今月セクションに月ラベルを表示する', () => {
    render(<EventsPage />)
    const month = getCurrentMonth()
    expect(screen.getByText(`${month}月開催`)).toBeInTheDocument()
  })

  it('来月セクションに月ラベルを表示する', () => {
    render(<EventsPage />)
    const month = getNextMonth()
    expect(screen.getByText(`${month}月開催`)).toBeInTheDocument()
  })

  it('「今月」バッジを表示する', () => {
    render(<EventsPage />)
    expect(screen.getByText('今月')).toBeInTheDocument()
  })

  it('「来月」バッジを表示する', () => {
    render(<EventsPage />)
    expect(screen.getByText('来月')).toBeInTheDocument()
  })

  it('今月のイベントが存在する場合イベント名を表示する', () => {
    const month = getCurrentMonth()
    const currentEvents = JAPAN_EVENTS.filter((e) => e.month === month)
    if (currentEvents.length === 0) return

    render(<EventsPage />)
    expect(screen.getByText(currentEvents[0].name)).toBeInTheDocument()
  })

  it('来月のイベントが存在する場合イベント名を表示する', () => {
    const month = getNextMonth()
    const nextEvents = JAPAN_EVENTS.filter((e) => e.month === month)
    if (nextEvents.length === 0) return

    render(<EventsPage />)
    expect(screen.getByText(nextEvents[0].name)).toBeInTheDocument()
  })

  it('イベントのカテゴリバッジを表示する', () => {
    const month = getCurrentMonth()
    const currentEvents = JAPAN_EVENTS.filter((e) => e.month === month)
    if (currentEvents.length === 0) return

    render(<EventsPage />)
    const first = currentEvents[0]
    const categoryLabels: Record<string, string> = {
      花火: '花火',
      祭り: '祭り',
      花: '花',
      音楽フェス: '音楽フェス',
      グルメフェス: 'グルメフェス',
      イルミネーション: 'イルミネーション',
      アート: 'アート',
      'アニメ・漫画': 'アニメ・漫画',
    }
    expect(
      screen.getAllByText(new RegExp(categoryLabels[first.category])).length
    ).toBeGreaterThanOrEqual(1)
  })

  it('イベントの都道府県と場所を表示する', () => {
    const month = getCurrentMonth()
    const currentEvents = JAPAN_EVENTS.filter((e) => e.month === month)
    if (currentEvents.length === 0) return

    render(<EventsPage />)
    const first = currentEvents[0]
    expect(
      screen.getByText(new RegExp(`${first.prefecture}.*${first.location}`))
    ).toBeInTheDocument()
  })

  it('URLがあるイベントには「公式」リンクを表示する', () => {
    const month = getCurrentMonth()
    const eventsWithUrl = JAPAN_EVENTS.filter((e) => e.month === month && e.url)
    if (eventsWithUrl.length === 0) return

    render(<EventsPage />)
    const officialLinks = screen.getAllByText('公式')
    expect(officialLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('免責注意文を表示する', () => {
    render(<EventsPage />)
    expect(screen.getByText(/掲載している開催日は例年の目安です/)).toBeInTheDocument()
  })
})
