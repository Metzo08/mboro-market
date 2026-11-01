import { test, expect } from '@playwright/test';

/**
 * Parcours critique e2e (CDC §19 Phase 3) :
 * Recherche → fiche produit → panier → checkout → commande.
 * Sans dépendance à un paiement réel (sandbox).
 */

const API = process.env.E2E_API_URL || 'http://localhost:3002/api';

test.describe('Parcours critique client', () => {
  test('health check backend accessible', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.checks.database.status).toBe('up');
  });

  test('accueil affiche des produits et boutiques (SSR)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Thiès/i);
    // Sections clés
    await expect(page.getByText('Catégories populaires')).toBeVisible();
    await expect(page.getByText(/Boutiques/i).first()).toBeVisible();
    // Produits rendus (cartes avec images)
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('recherche bilingue wolof → résultats', async ({ page }) => {
    await page.goto('/products?q=ceeb');
    await expect(page.locator('h1')).toBeVisible();
    // Au moins un produit (riz) trouvé grâce aux synonymes
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
  });

  test('ajout au panier → badge incrémenté → panier contient l’article', async ({ page }) => {
    await page.goto('/products');
    const firstCard = page.locator('a[href^="/products/"]').first();
    await firstCard.waitFor();

    // Cliquer "Ajouter au panier" sur la première carte
    const addBtn = page.getByRole('button', { name: /Ajouter au panier/i }).first();
    await addBtn.click();

    // Feedback visuel immédiat (CDC : bouton passe en "Ajouté")
    await expect(page.getByText(/Ajouté/i).first()).toBeVisible({ timeout: 5_000 });

    // Badge panier visible dans la navbar
    await expect(page.locator('nav').getByText(/^\d+$/).first()).toBeVisible();

    // Aller au panier
    await page.goto('/cart');
    await expect(page.getByText(/Résumé/i).first()).toBeVisible();
    await expect(page.locator('a[href="/checkout"]').first()).toBeVisible();
  });

  test('checkout invité complet → commande créée (voir checkout.spec.ts)', async () => {
    // Déplacé dans checkout.spec.ts — panier préparé via localStorage dans la même session
    expect(true).toBeTruthy();
  });

  test('fiche produit affiche JSON-LD Product (SEO CDC §11.2)', async ({ page }) => {
    await page.goto('/products');
    const href = await page.locator('a[href^="/products/"]').first().getAttribute('href');
    await page.goto(href!);
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const productSchema = jsonLd.find((t) => t.includes('"Product"'));
    expect(productSchema).toBeTruthy();
    const parsed = JSON.parse(productSchema!);
    expect(parsed['@type']).toBe('Product');
    expect(parsed.offers.priceCurrency).toBe('XOF');
  });

  test('fiche boutique affiche JSON-LD LocalBusiness', async ({ page }) => {
    await page.goto('/shops');
    const href = await page.locator('a[href^="/shops/"]').first().getAttribute('href');
    await page.goto(href!);
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const shopSchema = jsonLd.find((t) => /LocalBusiness|Store|Restaurant/.test(t));
    expect(shopSchema).toBeTruthy();
  });
});
