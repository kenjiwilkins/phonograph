export const isDev = import.meta.env.MODE === 'development';

export function getCookie(key: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${key}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || '';
  }
  return '';
}

export function setCookie(key: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const expiresString = expires.toUTCString();
  document.cookie = `${key}=${value}; expires=${expiresString}; path=/; secure; samesite=strict`;
}

export function removeCookie(key: string): void {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Legacy function names for backward compatibility
export function getLocalStorage(key: string): string {
  return getCookie(key);
}

export function setLocalStorage(key: string, value: string): void {
  setCookie(key, value);
}

export function removeLocalStorage(key: string): void {
  removeCookie(key);
}

export function verifyAccessToken(): boolean {
  const accessToken = getCookie('accessToken');
  if (!accessToken) return false;
  if (accessToken === 'undefined') return false;
  return true;
}

export function verifyRefreshToken(): boolean {
  const refreshToken = getCookie('refreshToken');
  if (!refreshToken) return false;
  if (refreshToken === 'undefined') return false;
  return true;
}

export function verifyExpiresIn(): boolean {
  const expiresIn = getCookie('expiresIn');
  if (!expiresIn) return false;
  if (expiresIn === 'undefined') return false;
  if (expiresIn === 'NaN') return false;
  return true;
}

export function getAccessToken(): string {
  return getCookie('accessToken');
}

export function resetAccessToken(): void {
  removeCookie('accessToken');
  removeCookie('refreshToken');
  removeCookie('expiresIn');
  removeCookie('verifier');
}

/**
 * Returns a random index in [0, total). When `exclude` is given and there is more than one
 * choice, that index is never returned, so the same item isn't picked twice in a row.
 */
export function randomOffset(total: number, exclude: number | null = null): number {
  if (exclude === null || exclude < 0 || exclude >= total || total <= 1) {
    return Math.floor(Math.random() * total);
  }
  const offset = Math.floor(Math.random() * (total - 1));
  return offset >= exclude ? offset + 1 : offset;
}
