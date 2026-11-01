import { test, expect } from '@playwright/test';

test('checkout invité avec panier pré-rempli affiche le formulaire', async ({ page }) => {
  await page.goto('/products');
  await page.evaluate(() => {
    window.localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          product: { id: 'seed-1', title: 'Produit test', price: 1000, slug: 'x', images: [] },
          quantity: 2,
        },
      ])
    );
  });
  await page.goto('/checkout');
  await expect(page.locator('form').first()).toBeVisible({ timeout: 20_000 });
});
