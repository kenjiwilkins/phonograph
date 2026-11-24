/**
 * Where the Spotify tokens are kept in the browser (#130).
 *
 * - Access token: sessionStorage. Survives reloads, is cleared when the tab closes and,
 *   unlike a cookie, is never sent along with requests to the app's own origin.
 * - Refresh token: localStorage, so a new tab or a restart doesn't require a new login.
 * - PKCE verifier: sessionStorage, only for the redirect to Spotify and back.
 *
 * JavaScript can still read these, so the Content-Security-Policy in vercel.json is the main
 * protection against XSS. A backend that keeps the refresh token in an HttpOnly cookie was
 * considered and rejected to keep the app deployable as static files.
 */

const keys = {
  accessToken: 'phonograph.accessToken',
  expiresAt: 'phonograph.expiresAt',
  refreshToken: 'phonograph.refreshToken',
  verifier: 'phonograph.pkceVerifier'
};

// Cookies written by versions before #130
const legacyCookies = ['accessToken', 'refreshToken', 'expiresIn', 'verifier'];

function read(storage: Storage, key: string): string | null {
  const value = storage.getItem(key);
  // Earlier versions could store these strings when a token request failed (#118)
  if (!value || value === 'undefined' || value === 'null' || value === 'NaN') return null;
  return value;
}

export function getAccessToken(): string | null {
  return read(sessionStorage, keys.accessToken);
}

/** Epoch milliseconds when the access token expires. */
export function getExpiresAt(): number | null {
  const value = read(sessionStorage, keys.expiresAt);
  const expiresAt = value === null ? NaN : Number(value);
  return Number.isFinite(expiresAt) ? expiresAt : null;
}

export function getRefreshToken(): string | null {
  return read(localStorage, keys.refreshToken);
}

export function saveTokens({
  accessToken,
  expiresAt,
  refreshToken
}: {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}) {
  sessionStorage.setItem(keys.accessToken, accessToken);
  sessionStorage.setItem(keys.expiresAt, String(expiresAt));
  // Spotify does not always rotate the refresh token; keep the current one if none is given
  if (refreshToken) localStorage.setItem(keys.refreshToken, refreshToken);
}

export function clearTokens() {
  sessionStorage.removeItem(keys.accessToken);
  sessionStorage.removeItem(keys.expiresAt);
  sessionStorage.removeItem(keys.verifier);
  localStorage.removeItem(keys.refreshToken);
}

export function saveVerifier(verifier: string) {
  sessionStorage.setItem(keys.verifier, verifier);
}

/** Returns the PKCE verifier and removes it: it is only valid for one code exchange. */
export function takeVerifier(): string | null {
  const verifier = read(sessionStorage, keys.verifier);
  sessionStorage.removeItem(keys.verifier);
  return verifier;
}

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
  const value = match ? decodeURIComponent(match.slice(name.length + 1)) : '';
  if (!value || value === 'undefined' || value === 'NaN') return null;
  return value;
}

/**
 * Moves tokens from the cookies earlier versions used into storage, then deletes the cookies,
 * so existing users stay logged in. Tokens already in storage are newer and win.
 */
export function migrateLegacyCookies() {
  const accessToken = readCookie('accessToken');
  const expiresAt = Number(readCookie('expiresIn'));
  const refreshToken = readCookie('refreshToken');

  if (!getRefreshToken() && refreshToken) {
    localStorage.setItem(keys.refreshToken, refreshToken);
  }
  if (!getAccessToken() && accessToken && Number.isFinite(expiresAt) && expiresAt > 0) {
    sessionStorage.setItem(keys.accessToken, accessToken);
    sessionStorage.setItem(keys.expiresAt, String(expiresAt));
  }
  for (const name of legacyCookies) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
}
