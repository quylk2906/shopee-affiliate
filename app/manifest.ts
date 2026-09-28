import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shopee & TikTok',
    short_name: 'Affiliate',
    description: 'Tạo link hoa hồng Shopee và TikTok Shop.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f0eee9',
    theme_color: '#005249',
    lang: 'vi',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
