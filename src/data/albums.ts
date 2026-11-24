import { defineStore } from 'pinia';
import { Album, UserSavedAlbumsItem } from '../types';
import { getUserSavedAlbums, getNextUserSavedAlbums, getUserSavedAlbumAt } from '../api';
import { randomOffset } from '../utils';

// The request currently loading a page. Callers that arrive while it is loading wait for it
// instead of returning early.
let inFlightRequest: Promise<void> | null = null;

export const useUserSavedAlbumsStore = defineStore('userSavedAlbums', {
  state: () => ({
    albums: [] as Album[],
    selectedAlbum: null as Album | null,
    hasNext: false,
    isLoading: false,
    nextUrl: '',
    totalAlbums: 0,
    lastRandomOffset: null as number | null
  }),
  actions: {
    clearAllStates() {
      inFlightRequest = null;
      this.albums = [];
      this.selectedAlbum = null;
      this.hasNext = false;
      this.isLoading = false;
      this.nextUrl = '';
      this.totalAlbums = 0;
      this.lastRandomOffset = null;
    },
    addAlbums(albums: Album[]) {
      const knownIds = new Set(this.albums.map((album) => album.id));
      const newAlbums = albums.filter((album) => !knownIds.has(album.id));
      this.albums.push(...newAlbums);
    },
    overwriteAlbums(albums: Album[]) {
      this.albums = albums;
    },
    setSelectedAlbum(album: Album) {
      this.selectedAlbum = album;
    },
    setSelectedAlbumRandomly(): void {
      if (this.albums.length === 0) {
        return;
      }
      // Exclude the current album so "Shuffle to Next Album" always changes it, unless it is the only one
      const candidates =
        this.albums.length > 1
          ? this.albums.filter((album) => album.id !== this.selectedAlbum?.id)
          : this.albums;
      const randomIndex = Math.floor(Math.random() * candidates.length);
      this.selectedAlbum = candidates[randomIndex];
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
    fetchUserSavedAlbums(): Promise<void> {
      if (inFlightRequest) return inFlightRequest;
      this.setIsLoading(true);
      inFlightRequest = (async () => {
        try {
          const data = await getUserSavedAlbums();
          // The first page replaces the list so calling this again never duplicates albums
          this.overwriteAlbums([]);
          this.addAlbums(data.items.map((item: UserSavedAlbumsItem) => item.album));
          this.setTotalAlbums(data.total);
          this.setHasNext(!!data.next);
          this.setNextUrl(data.next);
        } catch (error) {
          console.error(error);
          this.setNextUrl('');
          this.setHasNext(false);
          throw error;
        } finally {
          this.setIsLoading(false);
          inFlightRequest = null;
        }
      })();
      return inFlightRequest;
    },
    fetchNextUserSavedAlbums(): Promise<void> {
      if (inFlightRequest) return inFlightRequest.catch(() => undefined);
      if (!this.hasNext) return Promise.resolve();
      this.setIsLoading(true);
      inFlightRequest = (async () => {
        try {
          const data = await getNextUserSavedAlbums(this.nextUrl);
          this.addAlbums(data.items.map((item: UserSavedAlbumsItem) => item.album));
          this.setHasNext(!!data.next);
          this.setNextUrl(data.next);
        } catch (error) {
          console.error(error);
          this.setNextUrl('');
          this.setHasNext(false);
        } finally {
          this.setIsLoading(false);
          inFlightRequest = null;
        }
      })();
      return inFlightRequest;
    },
    /**
     * Selects a random saved album. When not every album is loaded yet, only the album at a
     * random offset is fetched (one request) instead of loading the whole library.
     */
    async pickRandomAlbum() {
      if (this.albums.length >= this.totalAlbums) {
        this.setSelectedAlbumRandomly();
        return;
      }
      let offset = randomOffset(this.totalAlbums, this.lastRandomOffset);
      let data = await getUserSavedAlbumAt(offset);
      let album: Album | undefined = data.items[0]?.album;
      // The album may have been selected from the list, so its offset isn't known up front
      if (album && album.id === this.selectedAlbum?.id && data.total > 1) {
        offset = (offset + 1) % data.total;
        data = await getUserSavedAlbumAt(offset);
        album = data.items[0]?.album;
      }
      this.setTotalAlbums(data.total);
      if (!album) return;
      this.lastRandomOffset = offset;
      this.setSelectedAlbum(album);
    }
  }
});
