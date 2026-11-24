import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSentryOptions } from '@/monitoring/sentry';

// Guards the Content-Security-Policy in vercel.json against drifting from what the app uses (#130)
const vercelConfig = JSON.parse(readFileSync(resolve(__dirname, '../../vercel.json'), 'utf8'));
const headers: { key: string; value: string }[] = vercelConfig.headers.find(
  (rule: { source: string }) => rule.source === '/(.*)'
).headers;
const header = (key: string) => headers.find((h) => h.key === key)?.value;
const csp = header('Content-Security-Policy') ?? '';
const directive = (name: string) =>
  csp
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .find(([key]) => key === name)
    ?.slice(1) ?? [];

function allows(sources: string[], url: string) {
  const { origin, hostname } = new URL(url);
  return sources.some(
    (source) =>
      source === origin ||
      (source.startsWith('https://*.') && hostname.endsWith(source.slice('https://*'.length)))
  );
}

describe('security headers (#130)', () => {
  test('only runs scripts from the app itself', () => {
    expect(directive('script-src')).toEqual(["'self'"]);
    expect(directive('object-src')).toEqual(["'none'"]);
    expect(directive('base-uri')).toEqual(["'self'"]);
    expect(directive('frame-ancestors')).toEqual(["'none'"]);
  });

  test('allows the Spotify API, Spotify accounts and Sentry', () => {
    const connect = directive('connect-src');
    expect(allows(connect, 'https://api.spotify.com/v1/me')).toBe(true);
    expect(allows(connect, 'https://accounts.spotify.com/api/token')).toBe(true);
    const sentryUrl = getSentryOptions({ production: true }).dsn.replace(/\/\/[^@]+@/, '//');
    expect(allows(connect, sentryUrl)).toBe(true);
  });

  test('allows the Sentry replay worker and the service worker', () => {
    expect(directive('worker-src')).toEqual(expect.arrayContaining(["'self'", 'blob:']));
  });

  test('sets the other security headers', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('X-Frame-Options')).toBe('DENY');
  });
});
