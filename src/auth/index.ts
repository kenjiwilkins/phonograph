import { isDev } from '../utils';
import {
  getCookie,
  setCookie,
  removeCookie,
  verifyAccessToken,
  verifyExpiresIn,
  verifyRefreshToken
} from '../utils';

const clientId = import.meta.env.VITE_APP_SPOTIFY_CLIENT_ID;
const deployURL = import.meta.env.VITE_APP_DEPLOY_URL || '';
const tenMinutes = 10 * 60 * 1000;

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

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = getCookie('verifier');

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', isDev ? 'http://localhost:5173/' : deployURL);
  params.append('code_verifier', verifier || '');

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  if (result.status !== 200) {
    console.log('error');
  }
  const json = await result.json();
  const { access_token, refresh_token, expires_in } = json;
  const expireTime = Date.now() + expires_in * 1000;
  window.history.pushState(null, '', '/');
  setCookie('accessToken', access_token);
  setCookie('refreshToken', refresh_token);
  setCookie('expiresIn', expireTime.toString());
  // Clean up the verifier cookie after successful authentication
  removeCookie('verifier');
  return access_token;
}

export async function getAccessTokenWithRefresh() {
  const refreshToken = getCookie('refreshToken');
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  if (result.status !== 200) {
    console.log('error');
  }
  const json = await result.json();
  const { access_token, expires_in, refresh_token } = json;
  const expireTime = Date.now() + expires_in * 1000;
  setCookie('accessToken', access_token);
  setCookie('refreshToken', refresh_token);
  setCookie('expiresIn', expireTime.toString());
  return access_token;
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

export function getAccessTokenFromCookies() {
  const accessToken = getCookie('accessToken');
  const expires_in = getCookie('expiresIn');
  const refreshToken = getCookie('refreshToken');
  if (accessToken === 'undefined' || accessToken === '') {
    removeCookie('accessToken');
    removeCookie('expiresIn');
    removeCookie('refreshToken');
    removeCookie('verifier'); // Also clean up verifier
  }
  if (expires_in && new Date(Date.now() - tenMinutes) > new Date(parseInt(expires_in))) {
    removeCookie('accessToken');
    removeCookie('expiresIn');
  }
  return {
    accessToken,
    refreshToken,
    expires_in
  };
}

export function getAuth() {
  redirectToAuthCodeFlow(clientId);
}

export async function useAuth() {
  const code = await getCode();

  // If there's a code, exchange it for tokens
  if (code) {
    try {
      const accessToken = await getAccessToken(clientId, code);
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

  // Check if we have valid tokens in cookies
  const { accessToken, expires_in, refreshToken } = getAccessTokenFromCookies();

  // If no access token exists, user needs to authenticate
  if (!verifyAccessToken() || !verifyExpiresIn() || !verifyRefreshToken()) {
    return {
      isAuthenticated: false,
      needsAuth: true
    };
  }

  // Check if token is expired (with 10 minute buffer)
  if (expires_in && new Date(Date.now() - tenMinutes) > new Date(parseInt(expires_in))) {
    // Try to refresh the token if we have a refresh token
    if (refreshToken) {
      try {
        const newAccessToken = await getAccessTokenWithRefresh();
        return {
          isAuthenticated: true,
          accessToken: newAccessToken,
          refreshed: true
        };
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Clear invalid tokens
        removeCookie('accessToken');
        removeCookie('refreshToken');
        removeCookie('expiresIn');
        return {
          isAuthenticated: false,
          needsAuth: true,
          error: 'Token refresh failed'
        };
      }
    } else {
      // No refresh token, clear expired tokens
      removeCookie('accessToken');
      removeCookie('expiresIn');
      return {
        isAuthenticated: false,
        needsAuth: true,
        error: 'Token expired and no refresh token available'
      };
    }
  }

  // Valid token exists
  return {
    isAuthenticated: true,
    accessToken
  };
}
