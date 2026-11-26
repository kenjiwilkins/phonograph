import { defineStore } from 'pinia';
import { Playlist, UserSavedPlaylistsItem } from '@/types';
import { getUserSavedPlaylists, getNextUserSavedPlaylists } from '@/api';
import { useLibraryTotalsStore } from './libraryTotals';

export const useUserSavedPlaylistsStore = defineStore('userSavedPlaylists', {
  state: () => ({
    playlists: [] as Playlist[],
    selectedPlaylist: null as Playlist | null,
    isLoading: false,
    nextUrl: '',
    totalPlaylists: 0
  }),
  getters: {
    hasNext(state) {
      return !!state.nextUrl;
    }
  },
  actions: {
    clearAllStates() {
      this.playlists = [];
      this.selectedPlaylist = null;
      this.isLoading = false;
      this.nextUrl = '';
      this.totalPlaylists = 0;
    },
    addPlaylists(playlists: Playlist[]) {
      const knownIds = new Set(this.playlists.map((playlist) => playlist.id));
      this.playlists.push(...playlists.filter((playlist) => !knownIds.has(playlist.id)));
    },
    overwritePlaylists(playlists: Playlist[]) {
      this.playlists = playlists;
    },
    setSelectedPlaylist(playlist: Playlist) {
      this.selectedPlaylist = playlist;
    },
    clearSelectedPlaylist() {
      this.selectedPlaylist = null;
    },
    setTotalPlaylists(totalPlaylists: number) {
      this.totalPlaylists = totalPlaylists;
      useLibraryTotalsStore().setPlaylists(totalPlaylists);
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
    async fetchUserSavedPlaylists() {
      if (this.isLoading) {
        return;
      }
      try {
        this.setIsLoading(true);
        const data = await getUserSavedPlaylists();
        // The first page replaces the list so calling this again never duplicates playlists
        this.overwritePlaylists([]);
        this.addPlaylists(data.items.map((item: UserSavedPlaylistsItem) => item));
        this.setTotalPlaylists(data.total);
        this.setNextUrl(data.next);
      } catch (error) {
        console.error(error);
        this.resetNextUrl();
      } finally {
        this.setIsLoading(false);
      }
    },
    async fetchNextUserSavedPlaylists() {
      if (this.isLoading || !this.hasNext) return;
      try {
        this.setIsLoading(true);
        const data = await getNextUserSavedPlaylists(this.nextUrl);
        this.addPlaylists(data.items);
        this.setNextUrl(data.next);
      } catch (error) {
        console.error(error);
        this.resetNextUrl();
      } finally {
        this.setIsLoading(false);
      }
    }
  }
});
