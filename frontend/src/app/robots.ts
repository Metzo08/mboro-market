import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/shops', '/cart', '/checkout'],
        disallow: ['/api/', '/merchant/', '/_next/', '/orders', '/login', '/register', '/verify-otp'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
