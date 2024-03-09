import axios from 'axios';
import { getLocalStorage, removeLocalStorage } from '../utils';
import { getAccessTokenWithRefresh } from '../auth';

const baseURL = 'https://api.spotify.com/v1';

const request = axios.create({
  baseURL
});

request.interceptors.request.use((config) => {
  const accessToken = getLocalStorage('accessToken');
  config.headers['Authorization'] = `Bearer ${accessToken}`;
  return config;
});
request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeLocalStorage('accessToken');
      getAccessTokenWithRefresh();
    }
    return Promise.reject(error);
  }
);

export async function getUserProfile() {
  const { data } = await request.get('/me');
  return data;
}

export async function getUserSavedAlbums() {
  const { data } = await request.get(`/me/albums?offset=0&limit=50`);
  return data;
}

export async function getNextUserSavedAlbums(url: string) {
  const { data } = await request.get(url);
  return data;
}
