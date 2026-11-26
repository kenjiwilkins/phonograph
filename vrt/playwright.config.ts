import { defineConfig, devices } from '@playwright/test';

// Baselines are not committed: they are captured from the base revision on the same machine
// (see CONTRIBUTING.md), so font rendering differences between machines never show up.
export default defineConfig({
  testDir: '.',
  outputDir: '../.vrt/results',
  snapshotPathTemplate: '{testDir}/../.vrt/baseline/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { outputFolder: '../.vrt/report', open: 'never' }]],
  expect: {
    // Exact: base and head are captured on the same machine, and on this dark UI the default
    // colour threshold (0.2) lets changes such as one surface shade pass
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixels: 0,
      threshold: 0,
      stylePath: './screenshot.css'
    }
  },
  use: {
    // Components stop their looping animations under reduced motion
    contextOptions: { reducedMotion: 'reduce' },
    locale: 'en-US',
    timezoneId: 'UTC'
  },
  projects: [
    // The two layouts of the design: phone, and 1024px and up
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }
    }
  ]
});
