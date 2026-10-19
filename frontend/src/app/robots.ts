export const dynamic = 'force-dynamic';

export default function Robots(): string {
  return `User-agent: *
Allow: /
Allow: /products
Allow: /shops
Allow: /cart
Allow: /checkout
Allow: /orders
Allow: /login
Allow: /register
Allow: /verify-otp
Disallow: /api/
Disallow: /merchant/
Disallow: /_next/

Sitemap: http://localhost:3001/sitemap.xml
`;
}
