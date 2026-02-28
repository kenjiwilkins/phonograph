import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as utils from '@/utils';

describe('utils', () => {
  let cookieMock = '';

  beforeEach(() => {
    cookieMock = '';
    vi.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieMock);
    vi.spyOn(document, 'cookie', 'set').mockImplementation((s) => {
      const parts = s.split(';');
      const [key, value] = parts[0].split('=');
      if (s.includes('expires=Thu, 01 Jan 1970')) {
        // Simple mock for removal
        cookieMock = cookieMock.replace(new RegExp(`${key.trim()}=[^;]+;?`), '');
      } else {
        cookieMock += `${key.trim()}=${value.trim()}; `;
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getCookie and setCookie', () => {
    utils.setCookie('testKey', 'testValue', 1);
    expect(utils.getCookie('testKey')).toBe('testValue');
  });

  test('getCookie returns empty string for non-existent key', () => {
    expect(utils.getCookie('nonExistent')).toBe('');
  });

  test('removeCookie', () => {
    utils.setCookie('testKey', 'testValue');
    expect(utils.getCookie('testKey')).toBe('testValue');
    utils.removeCookie('testKey');
    expect(utils.getCookie('testKey')).toBe('');
  });

  test('LocalStorage legacy functions', () => {
    utils.setLocalStorage('lsKey', 'lsValue');
    expect(utils.getLocalStorage('lsKey')).toBe('lsValue');
    utils.removeLocalStorage('lsKey');
    expect(utils.getLocalStorage('lsKey')).toBe('');
  });

  test('verifyAccessToken', () => {
    expect(utils.verifyAccessToken()).toBe(false);
    utils.setCookie('accessToken', 'token');
    expect(utils.verifyAccessToken()).toBe(true);
    utils.setCookie('accessToken', 'undefined');
    expect(utils.verifyAccessToken()).toBe(false);
  });

  test('verifyRefreshToken', () => {
    expect(utils.verifyRefreshToken()).toBe(false);
    utils.setCookie('refreshToken', 'token');
    expect(utils.verifyRefreshToken()).toBe(true);
    utils.setCookie('refreshToken', 'undefined');
    expect(utils.verifyRefreshToken()).toBe(false);
  });

  test('verifyExpiresIn', () => {
    expect(utils.verifyExpiresIn()).toBe(false);
    utils.setCookie('expiresIn', '123456');
    expect(utils.verifyExpiresIn()).toBe(true);
    utils.setCookie('expiresIn', 'undefined');
    expect(utils.verifyExpiresIn()).toBe(false);
    utils.setCookie('expiresIn', 'NaN');
    expect(utils.verifyExpiresIn()).toBe(false);
  });

  test('getAccessToken', () => {
    utils.setCookie('accessToken', 'myToken');
    expect(utils.getAccessToken()).toBe('myToken');
  });

  test('resetAccessToken', () => {
    utils.setCookie('accessToken', 'a');
    utils.setCookie('refreshToken', 'r');
    utils.setCookie('expiresIn', 'e');
    utils.setCookie('verifier', 'v');

    utils.resetAccessToken();

    expect(utils.getCookie('accessToken')).toBe('');
    expect(utils.getCookie('refreshToken')).toBe('');
    expect(utils.getCookie('expiresIn')).toBe('');
    expect(utils.getCookie('verifier')).toBe('');
  });
});
