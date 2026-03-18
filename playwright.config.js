// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Where tests live
  testDir: './QuotePolicyProcess',

  // Global timeouts
  timeout: 120_000,                 // per test
  expect: { timeout: 30_000 },      // for expect()

  // Retries / parallelism
  retries: 0,
  fullyParallel: false,
  workers: undefined,               // default

  // Reporters
  reporter: [
    ['list'],
    ['html', { open: process.env.CI ? 'never' : 'always', outputFolder: 'playwright-report' }]
    //  ☝️ 'never' on Jenkins (no browser to open), 'always' on local
  ],

  // Shared context for all tests
  use: {
    channel: 'chrome',

    // ✅ Headless on Jenkins (CI=true), headed locally
    headless: process.env.CI === 'true',

    launchOptions: {
      slowMo: process.env.CI ? 0 : 1000,  // ✅ No slowMo on Jenkins, 1000ms locally
      args: [
        '--disable-extensions',
        '--disable-popup-blocking',
        '--no-sandbox',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=BlockInsecurePrivateNetworkRequests',
      ],
    },

    viewport: { width: 1366, height: 850 },
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    ignoreHTTPSErrors: false,

    // ✅ Artifacts - saved on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  // Choose the browser(s)
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome'
      }
    }
  ],

  // Where artifacts go
  outputDir: 'test-results'
});
