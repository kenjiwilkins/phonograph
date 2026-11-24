import { describe, test, expect } from 'vitest';
import { getSentryOptions } from '@/monitoring/sentry';

describe('Sentry options (#129)', () => {
  test('samples a fraction of transactions instead of all of them', () => {
    const options = getSentryOptions({ production: true });
    expect(options.tracesSampleRate).toBeGreaterThan(0);
    expect(options.tracesSampleRate).toBeLessThanOrEqual(0.1);
  });

  test('records replays only for sessions with errors', () => {
    const options = getSentryOptions({ production: true });
    expect(options.replaysSessionSampleRate).toBe(0);
    expect(options.replaysOnErrorSampleRate).toBe(1);
  });

  test('masks text and media in replays', () => {
    expect(getSentryOptions({ production: true }).replayOptions).toEqual({
      maskAllText: true,
      blockAllMedia: true
    });
  });

  test('does not send personal data by default', () => {
    expect(getSentryOptions({ production: true }).sendDefaultPii).toBe(false);
  });

  test('is disabled outside production builds', () => {
    expect(getSentryOptions({ production: false }).enabled).toBe(false);
    expect(getSentryOptions({ production: true }).enabled).toBe(true);
  });
});
