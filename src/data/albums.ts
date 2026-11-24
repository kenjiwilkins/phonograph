import { defineStore } from 'pinia';
import { Album, AlbumSummary, UserSavedAlbumsItem } from '../types';
import {
  getUserSavedAlbums,
  getNextUserSavedAlbums,
  getUserSavedAlbumAt,
  getSavedAlbumsHead
} from '../api';
import { AlbumsFingerprint, readAlbumsCache, writeAlbumsCache } from '../cache/libraryCache';
import { useUserStore } from './user';
import { toAlbumSummary } from './summaries';
import { randomOffset } from '../utils';

/** Identifies the state of the saved albums list from its first page (see libraryCache). */
function fingerprintOf(data: { total: number; items: UserSavedAlbumsItem[] }): AlbumsFingerprint {
  const first = data.items[0];
  return {
    total: data.total,
    firstId: first?.album.id ?? null,
    firstAddedAt: first?.added_at ?? null
  };
}

function sameFingerprint(a: AlbumsFingerprint, b: AlbumsFingerprint) {
  return a.total === b.total && a.firstId === b.firstId && a.firstAddedAt === b.firstAddedAt;
}

// The request currently loading a page. Callers that arrive while it is loading wait for it
// instead of returning early.
let inFlightRequest: Promise<void> | null = null;

export const useUserSavedAlbumsStore = defineStore('userSavedAlbums', {
  state: () => ({
    albums: [] as AlbumSummary[],
    selectedAlbum: null as AlbumSummary | null,
    hasNext: false,
    isLoading: false,
    nextUrl: '',
    totalAlbums: 0,
    lastRandomOffset: null as number | null,
    fingerprint: null as AlbumsFingerprint | null
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
      this.fingerprint = null;
    },
    addAlbums(albums: AlbumSummary[]) {
      const knownIds = new Set(this.albums.map((album) => album.id));
      const newAlbums = albums.filter((album) => !knownIds.has(album.id)).map(toAlbumSummary);
      this.albums.push(...newAlbums);
    },
    overwriteAlbums(albums: AlbumSummary[]) {
      this.albums = albums.map(toAlbumSummary);
    },
    setSelectedAlbum(album: AlbumSummary) {
      this.selectedAlbum = toAlbumSummary(album);
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
          this.fingerprint = fingerprintOf(data);
          this.saveCache();
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
          this.saveCache();
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
     * Loads the saved albums, rendering the cached list right away when there is one
     * (stale-while-revalidate, #80). The cache is validated with a single `limit=1` request:
     * if the total or the most recently saved album changed, the first page is fetched again.
     * Otherwise the cached pages (including those loaded by scrolling) are kept.
     */
    async loadUserSavedAlbums() {
      const userId = useUserStore().user?.id;
      const cached = userId ? readAlbumsCache(userId) : null;
      if (!cached) return this.fetchUserSavedAlbums();

      this.overwriteAlbums(cached.albums);
      this.setTotalAlbums(cached.total);
      this.setNextUrl(cached.nextUrl);
      this.setHasNext(!!cached.nextUrl);
      this.fingerprint = cached.fingerprint;

      let current: AlbumsFingerprint;
      try {
        current = fingerprintOf(await getSavedAlbumsHead());
      } catch (error) {
        // Offline or a transient error: keep showing the cached list
        console.error(error);
        return;
      }
      if (!sameFingerprint(current, cached.fingerprint)) {
        await this.fetchUserSavedAlbums();
      }
    },
    saveCache() {
      const userId = useUserStore().user?.id;
      if (!userId || !this.fingerprint) return;
      writeAlbumsCache(userId, {
        albums: this.albums,
        total: this.totalAlbums,
        nextUrl: this.nextUrl ?? '',
        fingerprint: this.fingerprint
      });
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
