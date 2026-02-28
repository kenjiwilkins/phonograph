import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as auth from '@/auth';
import * as utils from '@/utils';

// Mocking document.location and window.location
const mockLocation = new URL('http://localhost:5173/');

// Use a proxy or a simple object to mock location
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

// Mocking fetch
global.fetch = vi.fn();

// Mocking crypto
const mockDigest = vi.fn().mockResolvedValue(new Uint8Array(32).buffer);
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest
    }
  }
});

// Mocking utils to avoid cookie issues in JSDOM
vi.mock('@/utils', async () => {
  const actual = (await vi.importActual('@/utils')) as any;
  const cookies: Record<string, string> = {};
  return {
    ...actual,
    getCookie: vi.fn((key) => cookies[key] || ''),
    setCookie: vi.fn((key, value) => {
      cookies[key] = value;
    }),
    removeCookie: vi.fn((key) => {
      delete cookies[key];
    }),
    verifyAccessToken: vi.fn(
      () => !!cookies['accessToken'] && cookies['accessToken'] !== 'undefined'
    ),
    verifyRefreshToken: vi.fn(
      () => !!cookies['refreshToken'] && cookies['refreshToken'] !== 'undefined'
    ),
    verifyExpiresIn: vi.fn(
      () =>
        !!cookies['expiresIn'] &&
        cookies['expiresIn'] !== 'undefined' &&
        cookies['expiresIn'] !== 'NaN'
    )
  };
});

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = 'http://localhost:5173/';
    locationMock.search = '';
    locationMock.pathname = '/';
  });

  test('getCode', async () => {
    locationMock.search = '?code=test-code';
    const code = await auth.getCode();
    expect(code).toBe('test-code');
  });

  test('redirectToAuthCodeFlow', async () => {
    const clientId = 'test-client-id';
    await auth.redirectToAuthCodeFlow(clientId);
    expect(utils.setCookie).toHaveBeenCalledWith('verifier', expect.anything(), 1);
    expect(locationMock.assign).toHaveBeenCalledWith(
      expect.stringContaining('https://accounts.spotify.com/authorize')
    );
    expect(locationMock.assign).toHaveBeenCalledWith(
      expect.stringContaining('client_id=test-client-id')
    );
  });

  test('getAccessToken', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600
    };
    (fetch as any).mockResolvedValue({
      status: 200,
      json: async () => mockTokenResponse
    });
    (utils.getCookie as any).mockImplementation((k: string) =>
      k === 'verifier' ? 'mock-verifier' : ''
    );

    const token = await auth.getAccessToken('client-id', 'code');
    expect(token).toBe('mock-access-token');
    expect(utils.setCookie).toHaveBeenCalledWith('accessToken', 'mock-access-token');
    expect(utils.setCookie).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
    expect(utils.removeCookie).toHaveBeenCalledWith('verifier');
  });

  test('getAccessTokenWithRefresh', async () => {
    const mockTokenResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 3600
    };
    (fetch as any).mockResolvedValue({
      status: 200,
      json: async () => mockTokenResponse
    });
    (utils.getCookie as any).mockImplementation((k: string) =>
      k === 'refreshToken' ? 'old-refresh-token' : ''
    );

    const token = await auth.getAccessTokenWithRefresh();
    expect(token).toBe('new-access-token');
    expect(utils.setCookie).toHaveBeenCalledWith('accessToken', 'new-access-token');
  });

  test('getAccessTokenFromCookies', () => {
    (utils.getCookie as any).mockImplementation((k: string) => {
      if (k === 'accessToken') return 'at';
      if (k === 'refreshToken') return 'rt';
      if (k === 'expiresIn') return (Date.now() + 3600000).toString();
      return '';
    });

    const result = auth.getAccessTokenFromCookies();
    expect(result.accessToken).toBe('at');
    expect(result.refreshToken).toBe('rt');
  });

  test('getAccessTokenFromCookies - cleans up undefined', () => {
    (utils.getCookie as any).mockImplementation((k: string) =>
      k === 'accessToken' ? 'undefined' : ''
    );
    auth.getAccessTokenFromCookies();
    expect(utils.removeCookie).toHaveBeenCalledWith('accessToken');
  });

  test('getAccessTokenFromCookies - cleans up expired', () => {
    (utils.getCookie as any).mockImplementation((k: string) => {
      if (k === 'accessToken') return 'at';
      if (k === 'expiresIn') return (Date.now() - 3600000).toString();
      return '';
    });
    auth.getAccessTokenFromCookies();
    expect(utils.removeCookie).toHaveBeenCalledWith('accessToken');
  });

  test('useAuth - with code', async () => {
    locationMock.search = '?code=auth-code';
    const mockTokenResponse = {
      access_token: 'at',
      refresh_token: 'rt',
      expires_in: 3600
    };
    (fetch as any).mockResolvedValue({
      status: 200,
      json: async () => mockTokenResponse
    });
    (utils.getCookie as any).mockImplementation((k: string) => (k === 'verifier' ? 'v' : ''));

    const result = await auth.useAuth();
    expect(result.isAuthenticated).toBe(true);
    expect(result.accessToken).toBe('at');
  });

  test('useAuth - no tokens', async () => {
    locationMock.search = '';
    (utils.verifyAccessToken as any).mockReturnValue(false);
    const result = await auth.useAuth();
    expect(result.isAuthenticated).toBe(false);
    expect(result.needsAuth).toBe(true);
  });

  test('useAuth - valid tokens', async () => {
    locationMock.search = '';
    (utils.verifyAccessToken as any).mockReturnValue(true);
    (utils.verifyExpiresIn as any).mockReturnValue(true);
    (utils.verifyRefreshToken as any).mockReturnValue(true);
    (utils.getCookie as any).mockImplementation((k: string) => {
      if (k === 'accessToken') return 'at';
      if (k === 'expiresIn') return (Date.now() + 3600000).toString();
      return '';
    });

    const result = await auth.useAuth();
    expect(result.isAuthenticated).toBe(true);
    expect(result.accessToken).toBe('at');
  });

  test('useAuth - expired with refresh success', async () => {
    locationMock.search = '';
    (utils.verifyAccessToken as any).mockReturnValue(true);
    (utils.verifyExpiresIn as any).mockReturnValue(true);
    (utils.verifyRefreshToken as any).mockReturnValue(true);
    (utils.getCookie as any).mockImplementation((k: string) => {
      if (k === 'accessToken') return 'at';
      if (k === 'refreshToken') return 'rt';
      if (k === 'expiresIn') return (Date.now() - 3600000).toString();
      return '';
    });

    const mockTokenResponse = {
      access_token: 'new-at',
      refresh_token: 'new-rt',
      expires_in: 3600
    };
    (fetch as any).mockResolvedValue({
      status: 200,
      json: async () => mockTokenResponse
    });

    const result = await auth.useAuth();
    expect(result.isAuthenticated).toBe(true);
    expect(result.accessToken).toBe('new-at');
    expect(result.refreshed).toBe(true);
  });
});
