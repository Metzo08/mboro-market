import { defineConfig, devices } from '@playwright/test';

/**
 * Config Playwright — JëndCiThiès
 * Parcours critique uniquement (funnel complet, pas de tests de style).
 * Serveurs démarrés automatiquement si absents.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1366, height: 900 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : [
      {
        command: 'npm run start:dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
        cwd: '../frontend',
      },
      {
        command: 'npm run start:prod',
        url: 'http://localhost:3002/api/health',
        reuseExistingServer: true,
        timeout: 120_000,
        cwd: '../backend',
      },
    ],
});
