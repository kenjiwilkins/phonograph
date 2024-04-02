import { defineStore } from 'pinia';
import { Album, UserSavedAlbumsItem } from '../types';
import { getUserSavedAlbums, getNextUserSavedAlbums } from '../api';

export const useUserSavedAlbumsStore = defineStore('userSavedAlbums', {
  state: () => ({
    albums: [] as Album[],
    selectedAlbum: null as Album | null,
    hasNext: false,
    isLoading: false,
    nextUrl: '',
    totalAlbums: 0
  }),
  actions: {
    clearAllStates() {
      this.albums = [];
      this.selectedAlbum = null;
      this.hasNext = false;
      this.isLoading = false;
      this.nextUrl = '';
      this.totalAlbums = 0;
    },
    addAlbums(albums: Album[]) {
      this.albums = [...this.albums, ...albums];
    },
    overwriteAlbums(albums: Album[]) {
      this.albums = albums;
    },
    setSelectedAlbum(album: Album) {
      this.selectedAlbum = album;
    },
    setSelectedAlbumRandomly() {
      if (this.albums.length === 0) {
        return;
      }
      const randomIndex = Math.floor(Math.random() * this.albums.length);
      this.selectedAlbum = this.albums[randomIndex];
    },
    clearSelectedAlbum() {
      this.selectedAlbum = null;
    },
    setTotalAlbums(totalAlbums: number) {
      this.totalAlbums = totalAlbums;
    },
    setHasNext(hasNext: boolean) {
      this.hasNext = hasNext;
    },
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },
    setNextUrl(nextUrl: string) {
      this.nextUrl = nextUrl;
    },
    resetNextUrl() {
      this.nextUrl = '';
    },
    async fetchUserSavedAlbums() {
      if (this.isLoading) {
        return;
      }
      try {
        this.setIsLoading(true);
        const data = await getUserSavedAlbums();
        this.addAlbums(data.items.map((item: UserSavedAlbumsItem) => item.album));
        this.setTotalAlbums(data.total);
        this.setHasNext(!!data.next);
        this.setNextUrl(data.next);
        this.setIsLoading(false);
      } catch (error) {
        this.setIsLoading(false);
        console.log(error);
        this.setNextUrl('');
        this.setHasNext(false);
        return Promise.reject(error);
      }
    },
    async fetchNextUserSavedAlbums() {
      if (!this.hasNext) {
        return;
      }
      try {
        this.setIsLoading(true);
        const data = await getNextUserSavedAlbums(this.nextUrl);
        this.addAlbums(data.items.map((item: UserSavedAlbumsItem) => item.album));
        this.setHasNext(!!data.next);
        this.setNextUrl(data.next);
        this.setIsLoading(false);
      } catch (error) {
        this.setIsLoading(false);
        console.log(error);
        this.setNextUrl('');
        this.setHasNext(false);
      }
    },
    async fetchAllUserSavedAlbums() {
      try {
        await this.fetchUserSavedAlbums();
        while (this.hasNext) {
          if (this.selectedAlbum || this.albums.length === 0) {
            return Promise.reject('User cancelled');
          }
          await this.fetchNextUserSavedAlbums();
        }
        this.setHasNext(false);
        this.setNextUrl('');
      } catch (error) {
        console.log(error);
        return Promise.reject(error);
      }
    }
  }
});
