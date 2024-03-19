import { isDev } from '../utils';
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
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

  localStorage.setItem('verifier', verifier);

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
  const verifier = localStorage.getItem('verifier');

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', isDev ? 'http://localhost:5173/' : deployURL);
  params.append('code_verifier', verifier!);

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
  setLocalStorage('accessToken', access_token);
  setLocalStorage('refreshToken', refresh_token);
  setLocalStorage('expiresIn', expireTime.toString());
  return access_token;
}

export async function getAccessTokenWithRefresh() {
  const refreshToken = getLocalStorage('refreshToken');
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
  setLocalStorage('accessToken', access_token);
  setLocalStorage('refreshToken', refresh_token);
  setLocalStorage('expiresIn', expireTime.toString());
  return access_token;
}

function generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

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

export function getAccessTokenFromLocalStorage() {
  const accessToken = getLocalStorage('accessToken');
  const expires_in = getLocalStorage('expiresIn');
  const refreshToken = getLocalStorage('refreshToken');
  if (accessToken === 'undefined') {
    removeLocalStorage('accessToken');
    removeLocalStorage('expiresIn');
    removeLocalStorage('refreshToken');
  }
  if (expires_in && new Date(Date.now() - tenMinutes) > new Date(parseInt(expires_in))) {
    removeLocalStorage('accessToken');
    removeLocalStorage('expiresIn');
  }
  return {
    accessToken,
    refreshToken,
    expires_in
  };
}

export async function useAuth() {
  const code = await getCode();
  const { expires_in, refreshToken } = getAccessTokenFromLocalStorage();
  if (code) {
    await getAccessToken(clientId, code);
    return;
  }
  if (!verifyAccessToken() || !verifyExpiresIn() || !verifyRefreshToken()) {
    return redirectToAuthCodeFlow(clientId);
  }
  if (expires_in && new Date(Date.now() - tenMinutes) > new Date(parseInt(expires_in))) {
    if (refreshToken) {
      return await getAccessTokenWithRefresh();
    }
    removeLocalStorage('accessToken');
    removeLocalStorage('refreshToken');
    removeLocalStorage('expiresIn');
  }
  if (expires_in && new Date(Date.now() - tenMinutes) > new Date(parseInt(expires_in))) {
    if (refreshToken) {
      return await getAccessTokenWithRefresh();
    }
    removeLocalStorage('accessToken');
    removeLocalStorage('refreshToken');
    removeLocalStorage('expiresIn');
  }
  return;
}
