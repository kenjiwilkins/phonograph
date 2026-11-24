import { describe, test, expect, beforeEach } from 'vitest';
import {
  saveTokens,
  getAccessToken,
  getExpiresAt,
  getRefreshToken,
  clearTokens,
  saveVerifier,
  takeVerifier,
  migrateLegacyCookies
} from '@/auth/tokenStorage';

function clearCookies() {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
}

describe('tokenStorage (#130)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();
  });

  test('keeps the access token for the tab and the refresh token across sessions, not in cookies', () => {
    saveTokens({ accessToken: 'at', expiresAt: 1234, refreshToken: 'rt' });

    expect(getAccessToken()).toBe('at');
    expect(getExpiresAt()).toBe(1234);
    expect(getRefreshToken()).toBe('rt');
    expect(Object.values({ ...sessionStorage })).toContain('at');
    expect(Object.values({ ...localStorage })).toContain('rt');
    expect(Object.values({ ...localStorage })).not.toContain('at');
    expect(document.cookie).toBe('');
  });

  test('keeps the current refresh token when none is given', () => {
    saveTokens({ accessToken: 'at', expiresAt: 1, refreshToken: 'rt' });
    saveTokens({ accessToken: 'at2', expiresAt: 2 });
    expect(getRefreshToken()).toBe('rt');
    expect(getAccessToken()).toBe('at2');
  });

  test('clearTokens removes everything', () => {
    saveTokens({ accessToken: 'at', expiresAt: 1, refreshToken: 'rt' });
    saveVerifier('v');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getExpiresAt()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(takeVerifier()).toBeNull();
  });

  test('the PKCE verifier can only be taken once', () => {
    saveVerifier('verifier');
    expect(takeVerifier()).toBe('verifier');
    expect(takeVerifier()).toBeNull();
  });

  test('treats corrupted values as missing', () => {
    sessionStorage.setItem('phonograph.accessToken', 'undefined');
    sessionStorage.setItem('phonograph.expiresAt', 'NaN');
    localStorage.setItem('phonograph.refreshToken', 'undefined');
    expect(getAccessToken()).toBeNull();
    expect(getExpiresAt()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  describe('migrateLegacyCookies', () => {
    test('moves tokens from cookies written by earlier versions and deletes the cookies', () => {
      document.cookie = 'accessToken=at; path=/';
      document.cookie = 'refreshToken=rt; path=/';
      document.cookie = 'expiresIn=1234; path=/';
      document.cookie = 'verifier=v; path=/';

      migrateLegacyCookies();

      expect(getAccessToken()).toBe('at');
      expect(getExpiresAt()).toBe(1234);
      expect(getRefreshToken()).toBe('rt');
      expect(document.cookie).toBe('');
    });

    test('ignores corrupted cookie values', () => {
      document.cookie = 'accessToken=undefined; path=/';
      document.cookie = 'refreshToken=undefined; path=/';
      document.cookie = 'expiresIn=NaN; path=/';

      migrateLegacyCookies();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(document.cookie).toBe('');
    });

    test('does not overwrite tokens that are already in storage', () => {
      saveTokens({ accessToken: 'new-at', expiresAt: 5, refreshToken: 'new-rt' });
      document.cookie = 'refreshToken=old-rt; path=/';

      migrateLegacyCookies();

      expect(getRefreshToken()).toBe('new-rt');
      expect(document.cookie).toBe('');
    });
  });
});
