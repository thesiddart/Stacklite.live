import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/terms', '/support'],
        disallow: ['/dashboard', '/c/', '/i/', '/login', '/signup', '/auth/'],
      },
    ],
    sitemap: 'https://stacklite.live/sitemap.xml',
  }
}
