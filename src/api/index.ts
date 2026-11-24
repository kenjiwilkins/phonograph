import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessTokenWithRefresh, getAuth } from '../auth';
import { getAccessToken } from '../auth/tokenStorage';

const baseURL = 'https://api.spotify.com/v1';

const request = axios.create({
  baseURL
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

request.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  config.headers['Authorization'] = `Bearer ${accessToken}`;
  return config;
});
request.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;
    if (error.response?.status !== 401 || !config || config._retry) {
      return Promise.reject(error);
    }
    config._retry = true;
    let accessToken: string;
    try {
      // Concurrent 401s share the same in-flight refresh
      accessToken = await getAccessTokenWithRefresh();
    } catch {
      // The refresh token is no longer valid: start the login flow again
      getAuth();
      return Promise.reject(error);
    }
    config.headers['Authorization'] = `Bearer ${accessToken}`;
    return request.request(config);
  }
);

export async function getUserProfile() {
  const { data } = await request.get('/me');
  return data;
}

export async function getUserSavedAlbums() {
  const { data } = await request.get(`/me/albums?offset=0&limit=50&market=from_token`);
  return data;
}

/** Fetches the single saved album at `offset`. Used to pick a random album without loading all of them. */
export async function getUserSavedAlbumAt(offset: number) {
  const { data } = await request.get('/me/albums', {
    // market=from_token drops the ~180-entry available_markets list from every album
    params: { offset, limit: 1, market: 'from_token' }
  });
  return data;
}

export async function getNextUserSavedAlbums(url: string) {
  const { data } = await request.get(url);
  return data;
}

export async function getUserSavedPlaylists() {
  const { data } = await request.get(`/me/playlists?offset=0&limit=50`);
  return data;
}

export async function getNextUserSavedPlaylists(url: string) {
  const { data } = await request.get(url);
  return data;
}

export async function getTracks(url: string) {
  const { data } = await request.get(url);
  return data;
}

/** Fetches the single playlist item at `offset` from a playlist's tracks endpoint. */
export async function getPlaylistTrackAt(tracksUrl: string, offset: number) {
  const { data } = await request.get(tracksUrl, { params: { offset, limit: 1 } });
  return data;
}
