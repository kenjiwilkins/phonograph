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

  test('getAccessTokenFromCookies - keeps tokens when expired so they can be refreshed (#116)', () => {
    (utils.getCookie as any).mockImplementation((k: string) => {
      if (k === 'accessToken') return 'at';
      if (k === 'refreshToken') return 'rt';
      if (k === 'expiresIn') return (Date.now() - 3600000).toString();
      return '';
    });
    const result = auth.getAccessTokenFromCookies();
    expect(utils.removeCookie).not.toHaveBeenCalledWith('accessToken');
    expect(utils.removeCookie).not.toHaveBeenCalledWith('refreshToken');
    expect(result.refreshToken).toBe('rt');
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
    (utils.verifyRefreshToken as any).mockReturnValue(false);
    const result = await auth.useAuth();
    expect(fetch).not.toHaveBeenCalled();
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

  describe('token expiry and refresh (#116)', () => {
    function mockCookies(values: Record<string, string>) {
      (utils.getCookie as any).mockImplementation((k: string) => values[k] || '');
      (utils.verifyAccessToken as any).mockReturnValue(!!values.accessToken);
      (utils.verifyRefreshToken as any).mockReturnValue(!!values.refreshToken);
      (utils.verifyExpiresIn as any).mockReturnValue(!!values.expiresIn);
    }
    function mockRefreshResponse() {
      (fetch as any).mockResolvedValue({
        status: 200,
        json: async () => ({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 })
      });
    }

    test('refreshes when the token expires within 10 minutes', async () => {
      locationMock.search = '';
      mockCookies({
        accessToken: 'at',
        refreshToken: 'rt',
        expiresIn: (Date.now() + 5 * 60 * 1000).toString()
      });
      mockRefreshResponse();

      const result = await auth.useAuth();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('new-at');
      expect(result.refreshed).toBe(true);
    });

    test('refreshes when only the refresh token remains', async () => {
      locationMock.search = '';
      mockCookies({ refreshToken: 'rt' });
      mockRefreshResponse();

      const result = await auth.useAuth();
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('new-at');
      expect(result.refreshed).toBe(true);
    });

    test('does not refresh when the token is valid for more than 10 minutes', async () => {
      locationMock.search = '';
      mockCookies({
        accessToken: 'at',
        refreshToken: 'rt',
        expiresIn: (Date.now() + 30 * 60 * 1000).toString()
      });

      const result = await auth.useAuth();
      expect(fetch).not.toHaveBeenCalled();
      expect(result.isAuthenticated).toBe(true);
      expect(result.accessToken).toBe('at');
    });

    test('needs auth when there is no refresh token and the access token is expired', async () => {
      locationMock.search = '';
      mockCookies({ accessToken: 'at', expiresIn: (Date.now() - 1000).toString() });

      const result = await auth.useAuth();
      expect(fetch).not.toHaveBeenCalled();
      expect(result.isAuthenticated).toBe(false);
      expect(result.needsAuth).toBe(true);
    });

    test('needs auth and clears tokens when the refresh fails', async () => {
      locationMock.search = '';
      mockCookies({ refreshToken: 'rt', expiresIn: (Date.now() - 1000).toString() });
      (fetch as any).mockResolvedValue({
        status: 400,
        json: async () => ({ error: 'invalid_grant' })
      });

      const result = await auth.useAuth();
      expect(result.isAuthenticated).toBe(false);
      expect(result.needsAuth).toBe(true);
      expect(utils.removeCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('refresh request (#117)', () => {
    test('sends client_id with the refresh token request', async () => {
      vi.stubEnv('VITE_APP_SPOTIFY_CLIENT_ID', 'test-client-id');
      (utils.getCookie as any).mockImplementation((k: string) =>
        k === 'refreshToken' ? 'rt' : ''
      );
      (fetch as any).mockResolvedValue({
        status: 200,
        json: async () => ({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 })
      });

      await auth.getAccessTokenWithRefresh();
      const body = (fetch as any).mock.calls[0][1].body as URLSearchParams;
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('refresh_token')).toBe('rt');
      expect(body.get('client_id')).toBe('test-client-id');
      vi.unstubAllEnvs();
    });
  });

  describe('failed token responses (#118)', () => {
    test('getAccessToken rejects and stores nothing on a non-200 response', async () => {
      (utils.getCookie as any).mockImplementation((k: string) => (k === 'verifier' ? 'v' : ''));
      (fetch as any).mockResolvedValue({
        status: 400,
        json: async () => ({ error: 'invalid_grant' })
      });

      await expect(auth.getAccessToken('client-id', 'code')).rejects.toThrow();
      expect(utils.setCookie).not.toHaveBeenCalled();
    });

    test('getAccessTokenWithRefresh rejects and stores nothing on a non-200 response', async () => {
      (utils.getCookie as any).mockImplementation((k: string) =>
        k === 'refreshToken' ? 'rt' : ''
      );
      (fetch as any).mockResolvedValue({
        status: 400,
        json: async () => ({ error: 'invalid_grant' })
      });

      await expect(auth.getAccessTokenWithRefresh()).rejects.toThrow();
      expect(utils.setCookie).not.toHaveBeenCalled();
    });

    test('keeps the existing refresh token when the response has no new one', async () => {
      (utils.getCookie as any).mockImplementation((k: string) =>
        k === 'refreshToken' ? 'rt' : ''
      );
      (fetch as any).mockResolvedValue({
        status: 200,
        json: async () => ({ access_token: 'new-at', expires_in: 3600 })
      });

      const token = await auth.getAccessTokenWithRefresh();
      expect(token).toBe('new-at');
      expect(utils.setCookie).toHaveBeenCalledWith('accessToken', 'new-at');
      const refreshTokenWrites = (utils.setCookie as any).mock.calls.filter(
        ([key]: [string]) => key === 'refreshToken'
      );
      expect(refreshTokenWrites).toHaveLength(0);
    });
  });

  describe('concurrent refresh (#119)', () => {
    test('shares one in-flight refresh request between concurrent callers', async () => {
      (utils.getCookie as any).mockImplementation((k: string) =>
        k === 'refreshToken' ? 'rt' : ''
      );
      (fetch as any).mockResolvedValue({
        status: 200,
        json: async () => ({ access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 })
      });

      const [a, b] = await Promise.all([
        auth.getAccessTokenWithRefresh(),
        auth.getAccessTokenWithRefresh()
      ]);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(a).toBe('new-at');
      expect(b).toBe('new-at');
    });
  });
});
