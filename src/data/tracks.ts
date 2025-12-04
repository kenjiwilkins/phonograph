import { defineStore } from 'pinia';
import { Track, TrackResponseItem } from '@/types';
import { getTracks } from '@/api';

export const useTracksStore = defineStore('tracks', {
  state: () => ({
    tracks: [] as Track[],
    selectedTrack: null as Track | null,
    isLoading: false,
    nextUrl: '',
    totalTracks: 0
  }),
  getters: {
    hasNext(state) {
      return !!state.nextUrl;
    }
  },
  actions: {
    clearAllStates() {
      this.tracks = [];
      this.selectedTrack = null;
      this.isLoading = false;
      this.nextUrl = '';
      this.totalTracks = 0;
    },
    addTracks(tracks: Track[]) {
      this.tracks = [...this.tracks, ...tracks];
    },
    overwriteTracks(tracks: Track[]) {
      this.tracks = tracks;
    },
    setSelectedTrack(track: Track) {
      this.selectedTrack = track;
    },
    setSelectedTrackRandomly(): void {
      if (this.tracks.length === 0) {
        return;
      }
      const randomIndex = Math.floor(Math.random() * this.tracks.length);
      if (this.tracks.length > 1 && this.selectedTrack === this.tracks[randomIndex]) {
        return this.setSelectedTrackRandomly();
      }
      this.setSelectedTrack(this.tracks[randomIndex]);
    },
    clearSelectedTrack() {
      this.selectedTrack = null;
    },
    setTotalTracks(totalTracks: number) {
      this.totalTracks = totalTracks;
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
    async fetchTracks() {
      if (this.isLoading) return;
      if (!this.hasNext) return;
      try {
        this.setIsLoading(true);
        const data = await getTracks(this.nextUrl);
        this.addTracks(data.items.map((item: TrackResponseItem) => item.track));
        this.setNextUrl(data.next);
      } catch (error) {
        console.error(error);
        this.resetNextUrl();
      } finally {
        this.setIsLoading(false);
      }
    },
    async fetchNextTracks() {
      if (this.isLoading) return;
      if (!this.hasNext) return;
      try {
        this.setIsLoading(true);
        const data = await getTracks(this.nextUrl);
        this.addTracks(data.items.map((item: TrackResponseItem) => item.track));
        this.setNextUrl(data.next);
      } catch (error) {
        console.error(error);
        this.resetNextUrl();
      } finally {
        this.setIsLoading(false);
      }
    },
    async fetchAllTracks() {
      try {
        while (this.hasNext) {
          if (this.selectedTrack) {
            return Promise.reject('User cancelled');
          }
          await this.fetchNextTracks();
        }
        this.setNextUrl('');
        return Promise.resolve();
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }
  }
});
