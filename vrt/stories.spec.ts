import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

// A built Storybook; set STORYBOOK_DIR to capture another revision's build
const storybookDir = path.resolve(process.env.STORYBOOK_DIR ?? 'storybook-static');
// Never resolved: every request for it is answered from storybookDir
const origin = 'http://storybook.test';

// The part of Storybook's preview global that tells how far the story has got
interface StoryPreview {
  currentRender?: { phase?: string };
}

interface IndexEntry {
  id: string;
  type: 'story' | 'docs';
}

const index = JSON.parse(readFileSync(path.join(storybookDir, 'index.json'), 'utf8'));
const stories = Object.values<IndexEntry>(index.entries).filter((entry) => entry.type === 'story');

test.beforeEach(async ({ page }) => {
  // The landing page shows the current year
  await page.clock.setFixedTime(new Date('2026-01-01T00:00:00Z'));
  // Serve the build from disk and block everything else, so screenshots never depend on the network
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const file = path.join(storybookDir, decodeURIComponent(url.pathname));
    return existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404 });
  });
});

for (const { id } of stories) {
  test(id, async ({ page }, testInfo) => {
    const name = `${id}.png`;
    const capturing = ['all', 'changed'].includes(testInfo.config.updateSnapshots);
    const isNew = !capturing && !existsSync(testInfo.snapshotPath(name, { kind: 'screenshot' }));

    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story`);
    // Storybook marks the body once the story has rendered or failed
    const body = page.locator('body');
    await expect(body).toHaveClass(/sb-show-(main|errordisplay|nopreview)/);
    await expect(body, 'the story failed to render').toHaveClass(/sb-show-main/);
    // Some stories interact first (e.g. opening a menu) in their play function
    await page.waitForFunction(() => {
      const preview = (window as unknown as { __STORYBOOK_PREVIEW__?: StoryPreview })
        .__STORYBOOK_PREVIEW__;
      return ['completed', 'finished'].includes(preview?.currentRender?.phase ?? '');
    });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => page.evaluate(() => [...document.images].every((image) => image.complete)))
      .toBe(true);

    // A story added since the baseline has nothing to compare with
    test.skip(isNew, 'new story: no baseline');
    await expect(page).toHaveScreenshot(name, { fullPage: true });
  });
}
