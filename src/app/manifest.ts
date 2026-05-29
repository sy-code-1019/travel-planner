import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'たびプラン',
    short_name: 'たびプラン',
    description: '旅行プランを作成・共有できるアプリ',
    start_url: '/plans',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
