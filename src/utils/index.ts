export const isDev = import.meta.env.MODE === 'development';

export function getLocalStorage(key: string): string {
  return localStorage.getItem(key)!;
}

export function setLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

export function verifyAccessToken(): boolean {
  const accessToken = getLocalStorage('accessToken');
  if (!accessToken) return false;
  if (accessToken === 'undefined') return false;
  return true;
}

export function verifyRefreshToken(): boolean {
  const refreshToken = getLocalStorage('refreshToken');
  if (!refreshToken) return false;
  if (refreshToken === 'undefined') return false;
  return true;
}

export function verifyExpiresIn(): boolean {
  const expiresIn = getLocalStorage('expiresIn');
  if (!expiresIn) return false;
  if (expiresIn === 'undefined') return false;
  if (expiresIn === 'NaN') return false;
  return true;
}

export function getAccessToken(): string {
  return getLocalStorage('accessToken');
}

export function resetAccessToken(): void {
  removeLocalStorage('accessToken');
}
