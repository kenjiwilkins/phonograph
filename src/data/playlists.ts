import { defineStore } from 'pinia';
import { Playlist } from '@/types';
import { getUserSavedPlaylists } from '@/api';

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
      this.playlists = [...this.playlists, ...playlists];
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
        this.addPlaylists(data.items.map((item: any) => item));
        this.setTotalPlaylists(data.total);
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
