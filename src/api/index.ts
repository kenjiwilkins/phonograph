import axios from "axios";
import { getAccessToken } from "../utils";

const baseURL = "https://api.spotify.com/v1";

const request = axios.create({
  baseURL,
});

request.interceptors.request.use((config) => {
  config.headers["Authorization"] = `Bearer ${getAccessToken()}`;
  return config;
});
request.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response.status === 401) {
    //   resetAccessToken();
    //   return useAuth();
    // }
    return Promise.reject(error);
  }
);

export async function getUserProfile() {
  const { data } = await request.get("/me");
  return data;
}

export async function getUserSavedAlbums(offset: number) {
  const { data } = await request.get(`/me/albums?offset=${offset}`);
  return data;
}

export async function getAllUserSavedAlbums(limit?: number) {
  let albums = [];
  let nextUrl = "/me/albums";
  let count = 0;
  while (nextUrl) {
    if (limit && count >= limit) {
      break;
    }
    const { data } = await request.get(nextUrl);
    const items = data.items.map((item: any) => item.album);
    albums.push(...items);
    nextUrl = data.next;
    count++;
  }
  return albums;
}
