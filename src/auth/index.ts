import { isDev } from '../utils';
import {
  getCookie,
  setCookie,
  removeCookie,
  verifyAccessToken,
  verifyExpiresIn,
  verifyRefreshToken
} from '../utils';

const deployURL = import.meta.env.VITE_APP_DEPLOY_URL || '';
const tenMinutes = 10 * 60 * 1000;

function getClientId(): string {
  return import.meta.env.VITE_APP_SPOTIFY_CLIENT_ID;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

async function requestToken(params: URLSearchParams): Promise<TokenResponse> {
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  if (result.status !== 200) {
    throw new Error(`Token request failed with status ${result.status}`);
  }
  const json = await result.json();
  if (!json.access_token || !json.expires_in) {
    throw new Error('Token response is missing access_token or expires_in');
  }
  return json;
}

function storeTokens({ access_token, expires_in, refresh_token }: TokenResponse) {
  const expireTime = Date.now() + expires_in * 1000;
  setCookie('accessToken', access_token);
  // Spotify does not always rotate the refresh token; keep the current one if none is returned
  if (refresh_token) {
    setCookie('refreshToken', refresh_token);
  }
  setCookie('expiresIn', expireTime.toString());
}

function clearTokens() {
  removeCookie('accessToken');
  removeCookie('refreshToken');
  removeCookie('expiresIn');
  removeCookie('verifier');
}

/** True when the token has expired or will expire within the buffer. */
export function isTokenExpiring(expiresAt: string, now: number = Date.now()): boolean {
  const expiresAtMs = parseInt(expiresAt);
  if (Number.isNaN(expiresAtMs)) return true;
  return now + tenMinutes >= expiresAtMs;
}

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  setCookie('verifier', verifier, 1); // 1 day expiry for verifier

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('response_type', 'code');
  params.append('redirect_uri', isDev ? 'http://localhost:5173/' : deployURL);
  params.append(
    'scope',
    'user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state'
  );
  params.append('code_challenge_method', 'S256');
  params.append('code_challenge', challenge);

  window.location.assign(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = getCookie('verifier');

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', isDev ? 'http://localhost:5173/' : deployURL);
  params.append('code_verifier', verifier || '');

  try {
    const token = await requestToken(params);
    storeTokens(token);
    return token.access_token;
  } finally {
    // The authorization code is single-use: remove it from the URL whether or not the exchange succeeded
    window.history.pushState(null, '', '/');
    removeCookie('verifier');
  }
}

let refreshPromise: Promise<string> | null = null;

/**
 * Refreshes the access token. Concurrent callers share a single in-flight request,
 * so a rotated refresh token is never used twice.
 */
export function getAccessTokenWithRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', getCookie('refreshToken'));
  params.append('client_id', getClientId());

  refreshPromise = requestToken(params)
    .then((token) => {
      storeTokens(token);
      return token.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function generateCodeVerifier(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function getCode() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('code');
}

/**
 * Reads the tokens from cookies and removes values that were corrupted by earlier
 * versions (e.g. the string "undefined"). Expired tokens are kept so that they can be refreshed.
 */
export function getAccessTokenFromCookies() {
  const accessToken = getCookie('accessToken');
  const expires_in = getCookie('expiresIn');
  const refreshToken = getCookie('refreshToken');
  if (accessToken === 'undefined') {
    removeCookie('accessToken');
  }
  if (expires_in === 'undefined' || expires_in === 'NaN') {
    removeCookie('expiresIn');
  }
  if (refreshToken === 'undefined') {
    removeCookie('refreshToken');
  }
  return {
    accessToken,
    refreshToken,
    expires_in
  };
}

export function getAuth() {
  redirectToAuthCodeFlow(getClientId());
}

export async function useAuth() {
  const code = await getCode();

  // If there's a code, exchange it for tokens
  if (code) {
    try {
      const accessToken = await getAccessToken(getClientId(), code);
      return {
        isAuthenticated: true,
        accessToken,
        code
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return {
        isAuthenticated: false,
        error: 'Failed to exchange authorization code'
      };
    }
  }

  const { accessToken, expires_in } = getAccessTokenFromCookies();
  const hasAccessToken = verifyAccessToken() && verifyExpiresIn();

  // Valid token that does not expire within the buffer
  if (hasAccessToken && !isTokenExpiring(expires_in)) {
    return {
      isAuthenticated: true,
      accessToken
    };
  }

  // Expired, expiring soon, or missing access token: refresh if possible
  if (!verifyRefreshToken()) {
    clearTokens();
    return {
      isAuthenticated: false,
      needsAuth: true
    };
  }

  try {
    const newAccessToken = await getAccessTokenWithRefresh();
    return {
      isAuthenticated: true,
      accessToken: newAccessToken,
      refreshed: true
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    return {
      isAuthenticated: false,
      needsAuth: true,
      error: 'Token refresh failed'
    };
  }
}
