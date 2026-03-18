import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './QuotePolicyProcess',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  retries: 0,
  fullyParallel: false,
  workers: undefined,

  reporter: [
    ['list'],
    ['html', { open: process.env.CI ? 'never' : 'always', outputFolder: 'playwright-report' }]
  ],

  use: {
    channel: 'chrome',
    // Headless on Jenkins, headed locally
    headless: process.env.CI === 'true',

    launchOptions: {
      slowMo: process.env.CI ? 0 : 1000,
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

    // ✅ Changed to 'on' so you always get a recording in Jenkins
    screenshot: 'only-on-failure',
    trace: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome'
      }
    }
  ],

  outputDir: 'test-results'
});
