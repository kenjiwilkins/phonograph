import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as auth from '@/auth';
import {
  getAccessToken as getStoredAccessToken,
  getExpiresAt,
  getRefreshToken,
  saveTokens,
  saveVerifier,
  takeVerifier
} from '@/auth/tokenStorage';
import { readAlbumsCache, writeAlbumsCache } from '@/cache/libraryCache';

// Mocking window.location
const mockLocation = new URL('http://localhost:5173/');
const locationMock = {
  assign: vi.fn(),
  replace: vi.fn(),
  toString: () => mockLocation.toString(),
  get href() {
    return mockLocation.href;
  },
  set href(url) {
    mockLocation.href = url;
  },
  get search() {
    return mockLocation.search;
  },
  set search(s) {
    mockLocation.search = s;
  },
  get pathname() {
    return mockLocation.pathname;
  },
  set pathname(p) {
    mockLocation.pathname = p;
  }
};
// @ts-ignore
delete window.location;
window.location = locationMock as any;

global.fetch = vi.fn();

Object.defineProperty(window, 'crypto', {
  value: { subtle: { digest: vi.fn().mockResolvedValue(new Uint8Array(32).buffer) } }
});

const tenMinutes = 10 * 60 * 1000;

function tokenResponse(body: Record<string, unknown>, status = 200) {
  return { status, json: async () => body };
}
function mockTokenEndpoint(body: Record<string, unknown>, status = 200) {
  (fetch as any).mockResolvedValue(tokenResponse(body, status));
}
function requestBody(call = 0): URLSearchParams {
  return (fetch as any).mock.calls[call][1].body as URLSearchParams;
}

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    locationMock.search = '';
    vi.stubEnv('VITE_APP_SPOTIFY_CLIENT_ID', 'test-client-id');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    // Nothing should ever be written to cookies (#130)
    expect(document.cookie).toBe('');
  });

  test('getCode', async () => {
    locationMock.search = '?code=test-code';
    expect(await auth.getCode()).toBe('test-code');
  });

  test('isTokenExpiring uses a 10 minute buffer', () => {
    const now = 1_000_000;
    expect(auth.isTokenExpiring(now + tenMinutes + 1, now)).toBe(false);
    expect(auth.isTokenExpiring(now + tenMinutes - 1, now)).toBe(true);
    expect(auth.isTokenExpiring(null, now)).toBe(true);
  });

  test('redirectToAuthCodeFlow keeps the PKCE verifier for the redirect back', async () => {
    await auth.redirectToAuthCodeFlow('test-client-id');
    expect(locationMock.assign).toHaveBeenCalledWith(
      expect.stringContaining('https://accounts.spotify.com/authorize')
    );
    expect(locationMock.assign).toHaveBeenCalledWith(
      expect.stringContaining('client_id=test-client-id')
    );
    expect(takeVerifier()).toHaveLength(128);
  });

  describe('getAccessToken (code exchange)', () => {
    test('exchanges the code with the stored verifier and stores the tokens', async () => {
      saveVerifier('the-verifier');
      mockTokenEndpoint({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 });

      const token = await auth.getAccessToken('client-id', 'code');

      expect(token).toBe('at');
      expect(requestBody().get('code_verifier')).toBe('the-verifier');
      expect(getStoredAccessToken()).toBe('at');
      expect(getRefreshToken()).toBe('rt');
      expect(getExpiresAt()).toBeGreaterThan(Date.now());
      expect(takeVerifier()).toBeNull();
    });

    test('rejects, stores nothing and still removes the code from the URL on failure (#118)', async () => {
      const pushState = vi.spyOn(window.history, 'pushState');
      mockTokenEndpoint({ error: 'invalid_grant' }, 400);

      await expect(auth.getAccessToken('client-id', 'code')).rejects.toThrow();
      expect(getStoredAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(pushState).toHaveBeenCalledWith(null, '', '/');
    });
  });

  describe('getAccessTokenWithRefresh', () => {
    test('sends client_id and the refresh token (#117)', async () => {
      saveTokens({ accessToken: 'old', expiresAt: 0, refreshToken: 'rt' });
      mockTokenEndpoint({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 });

      expect(await auth.getAccessTokenWithRefresh()).toBe('new-at');
      expect(requestBody().get('grant_type')).toBe('refresh_token');
      expect(requestBody().get('refresh_token')).toBe('rt');
      expect(requestBody().get('client_id')).toBe('test-client-id');
      expect(getStoredAccessToken()).toBe('new-at');
      expect(getRefreshToken()).toBe('new-rt');
    });

    test('rejects and stores nothing on a non-200 response (#118)', async () => {
      saveTokens({ accessToken: 'old', expiresAt: 0, refreshToken: 'rt' });
      mockTokenEndpoint({ error: 'invalid_grant' }, 400);

      await expect(auth.getAccessTokenWithRefresh()).rejects.toThrow();
      expect(getStoredAccessToken()).toBe('old');
      expect(getRefreshToken()).toBe('rt');
    });

    test('keeps the refresh token when Spotify does not return a new one (#118)', async () => {
      saveTokens({ accessToken: 'old', expiresAt: 0, refreshToken: 'rt' });
      mockTokenEndpoint({ access_token: 'new-at', expires_in: 3600 });

      await auth.getAccessTokenWithRefresh();
      expect(getRefreshToken()).toBe('rt');
    });

    test('shares one in-flight request between concurrent callers (#119)', async () => {
      saveTokens({ accessToken: 'old', expiresAt: 0, refreshToken: 'rt' });
      mockTokenEndpoint({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 });

      const [a, b] = await Promise.all([
        auth.getAccessTokenWithRefresh(),
        auth.getAccessTokenWithRefresh()
      ]);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect([a, b]).toEqual(['new-at', 'new-at']);
    });

    test('retries once with the refresh token another tab rotated in the meantime (#130)', async () => {
      saveTokens({ accessToken: 'old', expiresAt: 0, refreshToken: 'rt-1' });
      (fetch as any).mockImplementationOnce(async () => {
        // Another tab refreshed first and stored the rotated token
        saveTokens({ accessToken: 'other-tab-at', expiresAt: 0, refreshToken: 'rt-2' });
        return tokenResponse({ error: 'invalid_grant' }, 400);
      });
      (fetch as any).mockResolvedValueOnce(
        tokenResponse({ access_token: 'new-at', refresh_token: 'rt-3', expires_in: 3600 })
      );

      expect(await auth.getAccessTokenWithRefresh()).toBe('new-at');
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(requestBody(1).get('refresh_token')).toBe('rt-2');
      expect(getRefreshToken()).toBe('rt-3');
    });
  });

  describe('useAuth', () => {
    test('exchanges the code when returning from Spotify', async () => {
      locationMock.search = '?code=auth-code';
      saveVerifier('v');
      mockTokenEndpoint({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 });

      const result = await auth.useAuth();
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('at');
    });

    test('needs auth without any tokens', async () => {
      const result = await auth.useAuth();
      expect(fetch).not.toHaveBeenCalled();
      expect(result.isAuthenticated).toBe(false);
      expect(result.needsAuth).toBe(true);
    });

    test('uses a token that is valid for more than 10 minutes without refreshing (#116)', async () => {
      saveTokens({ accessToken: 'at', expiresAt: Date.now() + 30 * 60 * 1000, refreshToken: 'rt' });

      const result = await auth.useAuth();
      expect(fetch).not.toHaveBeenCalled();
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('at');
    });

    test('refreshes a token that expires within 10 minutes (#116)', async () => {
      saveTokens({ accessToken: 'at', expiresAt: Date.now() + 5 * 60 * 1000, refreshToken: 'rt' });
      mockTokenEndpoint({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 });

      const result = await auth.useAuth();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('new-at');
      expect(result.refreshed).toBe(true);
    });

    test('refreshes when only the refresh token remains (e.g. a new tab)', async () => {
      localStorage.setItem('phonograph.refreshToken', 'rt');
      mockTokenEndpoint({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 });

      const result = await auth.useAuth();
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('new-at');
    });

    test('needs auth when the access token expired and there is no refresh token', async () => {
      sessionStorage.setItem('phonograph.accessToken', 'at');
      sessionStorage.setItem('phonograph.expiresAt', String(Date.now() - 1000));

      const result = await auth.useAuth();
      expect(fetch).not.toHaveBeenCalled();
      expect(result.needsAuth).toBe(true);
      expect(getStoredAccessToken()).toBeNull();
    });

    test('needs auth and clears tokens when the refresh fails', async () => {
      saveTokens({ accessToken: 'at', expiresAt: Date.now() - 1000, refreshToken: 'rt' });
      mockTokenEndpoint({ error: 'invalid_grant' }, 400);

      const result = await auth.useAuth();
      expect(result.isAuthenticated).toBe(false);
      expect(result.needsAuth).toBe(true);
      expect(getRefreshToken()).toBeNull();
    });

    test('clears the cached library when the session can no longer be refreshed (#80)', async () => {
      writeAlbumsCache('user-1', {
        albums: [],
        total: 0,
        nextUrl: '',
        fingerprint: { total: 0, firstId: null, firstAddedAt: null }
      });
      saveTokens({ accessToken: 'at', expiresAt: Date.now() - 1000, refreshToken: 'rt' });
      mockTokenEndpoint({ error: 'invalid_grant' }, 400);

      await auth.useAuth();
      expect(readAlbumsCache('user-1')).toBeNull();
    });

    test('clears the cached library when there is no session (#80)', async () => {
      writeAlbumsCache('user-1', {
        albums: [],
        total: 0,
        nextUrl: '',
        fingerprint: { total: 0, firstId: null, firstAddedAt: null }
      });

      await auth.useAuth();
      expect(readAlbumsCache('user-1')).toBeNull();
    });

    test('moves tokens from cookies written by earlier versions (#130)', async () => {
      document.cookie = 'accessToken=cookie-at; path=/';
      document.cookie = `expiresIn=${Date.now() + 30 * 60 * 1000}; path=/`;
      document.cookie = 'refreshToken=cookie-rt; path=/';

      const result = await auth.useAuth();
      expect(fetch).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('cookie-at');
      expect(getRefreshToken()).toBe('cookie-rt');
    });
  });
});
