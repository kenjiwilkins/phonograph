import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as auth from '@/auth';

// Capture the interceptor handlers registered by src/api at import time
const mocks = vi.hoisted(() => {
  const instance = {
    get: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };
  return { instance };
});

vi.mock('axios', () => ({
  default: { create: vi.fn(() => mocks.instance) }
}));

vi.mock('@/auth', () => ({
  getAccessTokenWithRefresh: vi.fn(),
  getAuth: vi.fn()
}));

vi.mock('@/auth/tokenStorage', () => ({
  getAccessToken: vi.fn(() => 'current-token')
}));

await import('@/api');
const [, onResponseError] = mocks.instance.interceptors.response.use.mock.calls[0];

function unauthorizedError(config: Record<string, unknown> = {}) {
  return {
    config: { url: '/me', headers: {}, ...config },
    response: { status: 401 }
  };
}

describe('api response interceptor (#119)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('refreshes the token and retries the original request on 401', async () => {
    (auth.getAccessTokenWithRefresh as any).mockResolvedValue('new-token');
    mocks.instance.request.mockResolvedValue({ data: { id: 'user' } });

    const response = await onResponseError(unauthorizedError());

    expect(auth.getAccessTokenWithRefresh).toHaveBeenCalledTimes(1);
    expect(mocks.instance.request).toHaveBeenCalledTimes(1);
    const retriedConfig = mocks.instance.request.mock.calls[0][0];
    expect(retriedConfig.url).toBe('/me');
    expect(retriedConfig.headers['Authorization']).toBe('Bearer new-token');
    expect(response).toEqual({ data: { id: 'user' } });
  });

  test('does not retry a request that was already retried', async () => {
    const error = unauthorizedError({ _retry: true });

    await expect(onResponseError(error)).rejects.toBe(error);
    expect(auth.getAccessTokenWithRefresh).not.toHaveBeenCalled();
    expect(mocks.instance.request).not.toHaveBeenCalled();
  });

  test('sends the user to login when the refresh fails', async () => {
    (auth.getAccessTokenWithRefresh as any).mockRejectedValue(new Error('invalid_grant'));
    const error = unauthorizedError();

    await expect(onResponseError(error)).rejects.toBe(error);
    expect(mocks.instance.request).not.toHaveBeenCalled();
    expect(auth.getAuth).toHaveBeenCalledTimes(1);
  });

  test('passes through errors other than 401', async () => {
    const error = { config: { url: '/me', headers: {} }, response: { status: 500 } };

    await expect(onResponseError(error)).rejects.toBe(error);
    expect(auth.getAccessTokenWithRefresh).not.toHaveBeenCalled();
  });
});
