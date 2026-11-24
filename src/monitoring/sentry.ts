import type { BrowserOptions, replayIntegration } from '@sentry/vue';

type ReplayOptions = NonNullable<Parameters<typeof replayIntegration>[0]>;

// Header and query parameter names that can identify a user (Sentry's own v10 baseline)
const identifyingKeys = ['forwarded', '-ip', 'remote-', 'via', '-user'];

/**
 * Sentry settings, kept separate from main.ts so they can be unit tested.
 * `satisfies` makes TypeScript reject options Sentry no longer knows, instead of ignoring them.
 */
export function getSentryOptions({ production }: { production: boolean }) {
  return {
    dsn: 'https://c06db17657f9e563061f51b5cf97f47d@o4505332857700352.ingest.us.sentry.io/4506957397950464',
    // Don't report errors from local development
    enabled: production,
    // Don't attach IP addresses, cookies, request bodies or user details to events.
    // Sentry 11 collects these by default, so every category is turned off explicitly.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: identifyingKeys },
        response: { deny: identifyingKeys }
      },
      httpBodies: [],
      urlQueryParams: { deny: identifyingKeys }
    },
    // Performance monitoring: a sample is enough for a small app
    tracesSampleRate: 0.1,
    tracePropagationTargets: ['localhost', /^https:\/\/phonograph\.vercel\.app/],
    // Session Replay: only record sessions that hit an error
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    // Replays would otherwise capture the user's name, avatar and library
    replayOptions: {
      maskAllText: true,
      blockAllMedia: true
    }
  } satisfies BrowserOptions & { replayOptions: ReplayOptions };
}
