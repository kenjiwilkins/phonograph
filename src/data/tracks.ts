import { defineStore } from 'pinia';
import { Track, TrackResponseItem, TrackSummary } from '@/types';
import { getTracks, getPlaylistTrackAt } from '@/api';
import { randomOffset } from '@/utils';
import { readPlaylistTracksCache, writePlaylistTracksCache } from '@/cache/libraryCache';
import { useUserStore } from './user';
import { toTrackSummary } from './summaries';

/** Returns the tracks that can be shown and opened in Spotify. */
function playableTracks(items: TrackResponseItem[]): Track[] {
  return items
    .filter((entry) => !entry.is_local)
    .map((entry) => entry.item ?? entry.track)
    .filter((track): track is Track => !!track?.id && track.type !== 'episode');
}

// Removed tracks and local files can't be picked; give up after this many of them in a row
const maxRandomPickAttempts = 3;

// Incremented whenever the store switches to another playlist (or is cleared), so a page that
// was requested for the previous one is dropped instead of being added to, and cached for, the
// new one. Comparing playlist ids isn't enough: the same playlist can be opened again.
let generation = 0;

export const useTracksStore = defineStore('tracks', {
  state: () => ({
    tracks: [] as TrackSummary[],
    selectedTrack: null as TrackSummary | null,
    isLoading: false,
    nextUrl: '',
    totalTracks: 0,
    // The selected playlist's tracks endpoint, used to fetch single tracks at random offsets
    tracksUrl: '',
    lastRandomOffset: null as number | null,
    // Identify the open playlist's contents for the cache (#80)
    playlistId: '',
    snapshotId: undefined as string | undefined
  }),
  getters: {
    hasNext(state) {
      return !!state.nextUrl;
    }
  },
  actions: {
    clearAllStates() {
      generation++;
      this.tracks = [];
      this.selectedTrack = null;
      this.isLoading = false;
      this.nextUrl = '';
      this.totalTracks = 0;
      this.tracksUrl = '';
      this.lastRandomOffset = null;
      this.playlistId = '';
      this.snapshotId = undefined;
    },
    /**
     * Prepares the track list for a playlist. Tracks loaded earlier are restored from the cache
     * as long as the playlist's snapshot (its contents) hasn't changed.
     */
    openPlaylist({
      playlistId,
      snapshotId,
      url,
      total
    }: {
      playlistId: string;
      snapshotId?: string;
      url: string;
      total: number;
    }) {
      const userId = useUserStore().user?.id;
      const cached = userId ? readPlaylistTracksCache(userId, playlistId, snapshotId) : null;
      generation++;
      this.isLoading = false;
      this.playlistId = playlistId;
      this.snapshotId = snapshotId;
      this.tracksUrl = url;
      this.lastRandomOffset = null;
      this.overwriteTracks(cached?.tracks ?? []);
      this.setNextUrl(cached ? cached.nextUrl : url);
      this.setTotalTracks(cached?.total ?? total);
    },
    saveCache() {
      const userId = useUserStore().user?.id;
      if (!userId || !this.playlistId || !this.snapshotId) return;
      writePlaylistTracksCache(userId, this.playlistId, {
        snapshotId: this.snapshotId,
        tracks: this.tracks,
        total: this.totalTracks,
        nextUrl: this.nextUrl ?? ''
      });
    },
    setTracksUrl(tracksUrl: string) {
      this.tracksUrl = tracksUrl;
    },
    addTracks(tracks: TrackSummary[]) {
      this.tracks.push(...tracks.map(toTrackSummary));
    },
    overwriteTracks(tracks: TrackSummary[]) {
      this.tracks = tracks.map(toTrackSummary);
    },
    setSelectedTrack(track: TrackSummary) {
      this.selectedTrack = toTrackSummary(track);
    },
    setSelectedTrackRandomly(): void {
      if (this.tracks.length === 0) {
        return;
      }
      // Exclude the current track (by id: the selection is a copy) unless it is the only one.
      // A playlist can contain the same track several times, so compare ids, not lengths.
      const others = this.tracks.filter((track) => track.id !== this.selectedTrack?.id);
      const candidates = others.length > 0 ? others : this.tracks;
      this.setSelectedTrack(candidates[Math.floor(Math.random() * candidates.length)]);
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
      const requestGeneration = generation;
      try {
        this.setIsLoading(true);
        const data = await getTracks(this.nextUrl);
        // Another playlist was opened meanwhile: this page belongs to the previous one
        if (requestGeneration !== generation) return;
        this.addTracks(playableTracks(data.items));
        this.setNextUrl(data.next);
        this.saveCache();
      } catch (error) {
        if (requestGeneration !== generation) return;
        console.error(error);
        this.resetNextUrl();
      } finally {
        if (requestGeneration === generation) this.setIsLoading(false);
      }
    },
    fetchNextTracks() {
      return this.fetchTracks();
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
        const [track] = playableTracks(data.items);
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
