import { defineStore } from 'pinia';
import { Track, TrackResponseItem } from '@/types';
import { getTracks, getPlaylistTrackAt } from '@/api';
import { randomOffset } from '@/utils';

// Removed tracks come back as `track: null`; give up after this many empty picks
const maxRandomPickAttempts = 3;

export const useTracksStore = defineStore('tracks', {
  state: () => ({
    tracks: [] as Track[],
    selectedTrack: null as Track | null,
    isLoading: false,
    nextUrl: '',
    totalTracks: 0,
    // The selected playlist's tracks endpoint, used to fetch single tracks at random offsets
    tracksUrl: '',
    lastRandomOffset: null as number | null
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
      this.tracksUrl = '';
      this.lastRandomOffset = null;
    },
    setTracksUrl(tracksUrl: string) {
      this.tracksUrl = tracksUrl;
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
    /**
     * Selects a random track of the selected playlist. When not every track is loaded yet, only
     * the track at a random offset is fetched (one request) instead of loading the whole playlist.
     */
    async pickRandomTrack() {
      if (this.tracks.length >= this.totalTracks || !this.tracksUrl) {
        this.setSelectedTrackRandomly();
        return;
      }
      let exclude = this.lastRandomOffset;
      for (let attempt = 0; attempt < maxRandomPickAttempts; attempt++) {
        const offset = randomOffset(this.totalTracks, exclude);
        const data = await getPlaylistTrackAt(this.tracksUrl, offset);
        this.setTotalTracks(data.total);
        const track: Track | null | undefined = data.items[0]?.track;
        if (track && track.id !== this.selectedTrack?.id) {
          this.lastRandomOffset = offset;
          this.setSelectedTrack(track);
          return;
        }
        exclude = offset;
      }
    }
  }
});
