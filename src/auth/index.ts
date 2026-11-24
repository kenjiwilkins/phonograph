import { isDev } from '../utils';
import {
  clearTokens,
  getAccessToken as getStoredAccessToken,
  getExpiresAt,
  getRefreshToken,
  migrateLegacyCookies,
  saveTokens,
  saveVerifier,
  takeVerifier
} from './tokenStorage';
import { clearLibraryCache } from '../cache/libraryCache';

/** Ends the session: tokens and the cached library (which holds personal data) are removed. */
function endSession() {
  clearTokens();
  clearLibraryCache();
}

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
  saveTokens({
    accessToken: access_token,
    expiresAt: Date.now() + expires_in * 1000,
    refreshToken: refresh_token
  });
}

/** True when the token has expired or will expire within the buffer. */
export function isTokenExpiring(expiresAt: number | null, now: number = Date.now()): boolean {
  if (expiresAt === null) return true;
  return now + tenMinutes >= expiresAt;
}

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  saveVerifier(verifier);

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
  const verifier = takeVerifier();

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
  }
}

let refreshPromise: Promise<string> | null = null;

function refreshWith(refreshToken: string | null): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken ?? '');
  params.append('client_id', getClientId());
  return requestToken(params);
}

async function refresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  let token: TokenResponse;
  try {
    token = await refreshWith(refreshToken);
  } catch (error) {
    // Refresh tokens are rotated and shared between tabs through localStorage: if another tab
    // refreshed first, ours is no longer valid but the stored one is, so retry once with it
    const latest = getRefreshToken();
    if (!latest || latest === refreshToken) throw error;
    token = await refreshWith(latest);
  }
  storeTokens(token);
  return token.access_token;
}

/**
 * Refreshes the access token. Concurrent callers share a single in-flight request,
 * so a rotated refresh token is never used twice.
 */
export function getAccessTokenWithRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refresh().finally(() => {
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

  migrateLegacyCookies();
  const accessToken = getStoredAccessToken();

  // Valid token that does not expire within the buffer
  if (accessToken && !isTokenExpiring(getExpiresAt())) {
    return {
      isAuthenticated: true,
      accessToken
    };
  }

  // Expired, expiring soon, or missing access token: refresh if possible
  if (!getRefreshToken()) {
    endSession();
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
    endSession();
    return {
      isAuthenticated: false,
      needsAuth: true,
      error: 'Token refresh failed'
    };
  }
}
