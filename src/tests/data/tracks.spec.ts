import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { isReactive } from 'vue';
import { useTracksStore } from '@/data/tracks';
import { Track } from '@/types';
import * as api from '@/api';
import { useUserStore } from '@/data';
import { readPlaylistTracksCache, writePlaylistTracksCache } from '@/cache/libraryCache';
import type { User } from '@/types';
import { faker } from '@faker-js/faker';

// Helper to generate a mock track
const generateTrack = (): Track => ({
  id: faker.string.uuid(),
  name: faker.music.songName(),
  album: {
    id: faker.string.uuid(),
    name: faker.music.songName(),
    images: [],
    uri: faker.internet.url(),
    artists: [],
    external_urls: { spotify: '' },
    release_date: '',
    release_date_precision: 'year',
    total_tracks: 10,
    type: 'album',
    copyrights: [],
    genres: [],
    label: '',
    tracks: { items: [] }
  },
  artists: [],
  duration_ms: faker.number.int({ min: 10000, max: 300000 }),
  uri: faker.internet.url(),
  explicit: false,
  external_urls: { spotify: '' },
  type: 'track'
});

describe('TracksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('should have initial state', () => {
    const store = useTracksStore();
    expect(store.tracks).toEqual([]);
    expect(store.selectedTrack).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.nextUrl).toBe('');
    expect(store.totalTracks).toBe(0);
    expect(store.hasNext).toBe(false);
  });

  it('should add tracks', () => {
    const store = useTracksStore();
    const tracks = [generateTrack(), generateTrack()];
    store.addTracks(tracks);
    expect(store.tracks).toHaveLength(2);
    expect(store.tracks.map((t) => t.id)).toEqual(tracks.map((t) => t.id));
  });

  it('should overwrite tracks', () => {
    const store = useTracksStore();
    const initialTracks = [generateTrack()];
    store.addTracks(initialTracks);
    const newTracks = [generateTrack(), generateTrack()];
    store.overwriteTracks(newTracks);
    expect(store.tracks).toHaveLength(2);
    expect(store.tracks.map((t) => t.id)).toEqual(newTracks.map((t) => t.id));
  });

  it('should set selected track', () => {
    const store = useTracksStore();
    const track = generateTrack();
    store.setSelectedTrack(track);
    expect(store.selectedTrack?.id).toBe(track.id);
  });

  it('should clear selected track', () => {
    const store = useTracksStore();
    const track = generateTrack();
    store.setSelectedTrack(track);
    store.clearSelectedTrack();
    expect(store.selectedTrack).toBeNull();
  });

  it('should set total tracks', () => {
    const store = useTracksStore();
    store.setTotalTracks(100);
    expect(store.totalTracks).toBe(100);
  });

  it('should set is loading', () => {
    const store = useTracksStore();
    store.setIsLoading(true);
    expect(store.isLoading).toBe(true);
  });

  it('should set next url', () => {
    const store = useTracksStore();
    const url = faker.internet.url();
    store.setNextUrl(url);
    expect(store.nextUrl).toBe(url);
    expect(store.hasNext).toBe(true);
  });

  it('should reset next url', () => {
    const store = useTracksStore();
    store.setNextUrl(faker.internet.url());
    store.resetNextUrl();
    expect(store.nextUrl).toBe('');
    expect(store.hasNext).toBe(false);
  });

  it('should clear all states', () => {
    const store = useTracksStore();
    store.addTracks([generateTrack()]);
    store.setSelectedTrack(generateTrack());
    store.setIsLoading(true);
    store.setNextUrl('http://example.com');
    store.setTotalTracks(10);

    store.clearAllStates();

    expect(store.tracks).toEqual([]);
    expect(store.selectedTrack).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.nextUrl).toBe('');
    expect(store.totalTracks).toBe(0);
  });

  it('should set selected track randomly', () => {
    const store = useTracksStore();
    const tracks = [generateTrack(), generateTrack(), generateTrack()];
    store.addTracks(tracks);

    store.setSelectedTrackRandomly();
    expect(store.selectedTrack).not.toBeNull();
    expect(tracks.map((t) => t.id)).toContain(store.selectedTrack?.id);
  });

  it('should not set selected track randomly if no tracks', () => {
    const store = useTracksStore();
    store.setSelectedTrackRandomly();
    expect(store.selectedTrack).toBeNull();
  });

  it('should handle single track already selected (prevent infinite recursion)', () => {
    const store = useTracksStore();
    const track = generateTrack();
    store.addTracks([track]);
    store.setSelectedTrack(track);

    store.setSelectedTrackRandomly();

    // Should remain the same track without crashing
    expect(store.selectedTrack?.id).toBe(track.id);
  });

  describe('Async Actions', () => {
    const mockTracksResponse: {
      items: { track: Track }[];
      next: string | null;
      total: number;
      limit: number;
      offset: number;
      href: string;
      previous: string | null;
    } = {
      items: [{ track: generateTrack() }, { track: generateTrack() }],
      next: faker.internet.url(),
      total: 10,
      limit: 2,
      offset: 0,
      href: faker.internet.url(),
      previous: null
    };

    it('should fetch tracks', async () => {
      const store = useTracksStore();
      store.setNextUrl('http://api.spotify.com/v1/me/tracks');

      const getTracksSpy = vi.spyOn(api, 'getTracks').mockResolvedValue(mockTracksResponse);

      await store.fetchTracks();

      expect(store.isLoading).toBe(false);
      expect(store.tracks).toHaveLength(2);
      expect(store.nextUrl).toBe(mockTracksResponse.next);
      expect(getTracksSpy).toHaveBeenCalledWith('http://api.spotify.com/v1/me/tracks');
    });

    it('should handle fetch tracks error', async () => {
      const store = useTracksStore();
      store.setNextUrl('http://api.spotify.com/v1/me/tracks');

      vi.spyOn(api, 'getTracks').mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await store.fetchTracks();

      expect(store.isLoading).toBe(false);
      expect(store.nextUrl).toBe('');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not fetch tracks if loading', async () => {
      const store = useTracksStore();
      store.setIsLoading(true);
      const getTracksSpy = vi.spyOn(api, 'getTracks');

      await store.fetchTracks();

      expect(getTracksSpy).not.toHaveBeenCalled();
    });

    it('should not fetch tracks if no next url', async () => {
      const store = useTracksStore();
      store.setNextUrl('');
      const getTracksSpy = vi.spyOn(api, 'getTracks');

      await store.fetchTracks();

      expect(getTracksSpy).not.toHaveBeenCalled();
    });

    it('should fetch next tracks', async () => {
      const store = useTracksStore();
      store.setNextUrl('http://api.spotify.com/v1/me/tracks?offset=2');

      const getTracksSpy = vi.spyOn(api, 'getTracks').mockResolvedValue(mockTracksResponse);

      await store.fetchNextTracks();

      expect(store.isLoading).toBe(false);
      expect(store.tracks).toHaveLength(2);
      expect(store.nextUrl).toBe(mockTracksResponse.next);
      expect(getTracksSpy).toHaveBeenCalledWith('http://api.spotify.com/v1/me/tracks?offset=2');
    });
  });

  describe('pickRandomTrack (#120)', () => {
    const playlistTracksUrl = 'https://api.spotify.com/v1/playlists/abc/tracks';

    it('fetches a single track at a random offset when not all tracks are loaded', async () => {
      const store = useTracksStore();
      store.setTracksUrl(playlistTracksUrl);
      store.setTotalTracks(200);
      const track = generateTrack();
      const spy = vi
        .spyOn(api, 'getPlaylistTrackAt')
        .mockResolvedValue({ items: [{ track }], total: 200 });
      vi.spyOn(Math, 'random').mockReturnValue(0.25);

      await store.pickRandomTrack();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(playlistTracksUrl, 50);
      expect(store.selectedTrack?.id).toBe(track.id);
    });

    it('picks from the loaded tracks without a request when all tracks are loaded', async () => {
      const store = useTracksStore();
      const tracks = [generateTrack(), generateTrack()];
      store.setTracksUrl(playlistTracksUrl);
      store.addTracks(tracks);
      store.setTotalTracks(2);
      const spy = vi.spyOn(api, 'getPlaylistTrackAt');

      await store.pickRandomTrack();

      expect(spy).not.toHaveBeenCalled();
      expect(tracks.map((track) => track.id)).toContain(store.selectedTrack?.id);
    });

    it('tries another offset when the item has no track (removed track)', async () => {
      const store = useTracksStore();
      store.setTracksUrl(playlistTracksUrl);
      store.setTotalTracks(10);
      const track = generateTrack();
      const spy = vi
        .spyOn(api, 'getPlaylistTrackAt')
        .mockResolvedValueOnce({ items: [{ track: null }], total: 10 })
        .mockResolvedValueOnce({ items: [{ track }], total: 10 });
      vi.spyOn(Math, 'random').mockReturnValue(0);

      await store.pickRandomTrack();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(store.selectedTrack?.id).toBe(track.id);
    });

    it('resets the tracks url with clearAllStates', () => {
      const store = useTracksStore();
      store.setTracksUrl(playlistTracksUrl);
      store.clearAllStates();
      expect(store.tracksUrl).toBe('');
    });
  });

  it('does not make stored tracks deeply reactive (#121)', () => {
    const store = useTracksStore();
    store.addTracks([generateTrack()]);
    expect(isReactive(store.tracks[0])).toBe(false);
  });

  it('skips removed tracks and local files when fetching (#127)', async () => {
    const store = useTracksStore();
    store.setNextUrl('https://api.spotify.com/v1/playlists/abc/tracks');
    const track = generateTrack();
    vi.spyOn(api, 'getTracks').mockResolvedValue({
      items: [
        { track: null },
        { is_local: true, track: { ...generateTrack(), id: null } },
        { track }
      ],
      next: null
    });

    await store.fetchTracks();

    expect(store.tracks.map((t) => t.id)).toEqual([track.id]);
  });

  it('skips local files when picking a random track (#127)', async () => {
    const store = useTracksStore();
    store.setTracksUrl('https://api.spotify.com/v1/playlists/abc/tracks');
    store.setTotalTracks(10);
    const track = generateTrack();
    vi.spyOn(api, 'getPlaylistTrackAt')
      .mockResolvedValueOnce({ items: [{ is_local: true, track: generateTrack() }], total: 10 })
      .mockResolvedValueOnce({ items: [{ track }], total: 10 });

    await store.pickRandomTrack();
    expect(store.selectedTrack?.id).toBe(track.id);
  });

  it('reads playlist items from the new `item` field (#131)', async () => {
    const store = useTracksStore();
    store.setNextUrl('https://api.spotify.com/v1/playlists/abc/items');
    const track = generateTrack();
    vi.spyOn(api, 'getTracks').mockResolvedValue({ items: [{ item: track }], next: null });

    await store.fetchTracks();
    expect(store.tracks.map((t) => t.id)).toEqual([track.id]);
  });

  it('skips podcast episodes in playlists (#131)', async () => {
    const store = useTracksStore();
    store.setNextUrl('https://api.spotify.com/v1/playlists/abc/items');
    const track = generateTrack();
    vi.spyOn(api, 'getTracks').mockResolvedValue({
      items: [{ item: { ...generateTrack(), type: 'episode' } }, { item: track }],
      next: null
    });

    await store.fetchTracks();
    expect(store.tracks.map((t) => t.id)).toEqual([track.id]);
  });

  it('picks a random track from the new `item` field (#131)', async () => {
    const store = useTracksStore();
    store.setTracksUrl('https://api.spotify.com/v1/playlists/abc/items');
    store.setTotalTracks(10);
    const track = generateTrack();
    vi.spyOn(api, 'getPlaylistTrackAt').mockResolvedValue({ items: [{ item: track }], total: 10 });

    await store.pickRandomTrack();
    expect(store.selectedTrack?.id).toBe(track.id);
  });

  it('keeps only the track fields the UI needs (#80)', () => {
    const store = useTracksStore();
    store.addTracks([generateTrack()]);
    expect(store.tracks[0]).not.toHaveProperty('duration_ms');
    expect(store.tracks[0].album).not.toHaveProperty('tracks');
  });

  describe('playlist tracks cache (#80)', () => {
    const url = 'https://api.spotify.com/v1/playlists/p1/items';

    beforeEach(() => {
      localStorage.clear();
      useUserStore().setUser({ id: 'user-1' } as User);
    });

    it('starts empty when the playlist is not cached', () => {
      const store = useTracksStore();
      store.addTracks([generateTrack()]);

      store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });

      expect(store.tracks).toHaveLength(0);
      expect(store.nextUrl).toBe(url);
      expect(store.tracksUrl).toBe(url);
      expect(store.totalTracks).toBe(30);
    });

    it('restores cached tracks for the same snapshot', () => {
      const cachedTrack = generateTrack();
      writePlaylistTracksCache('user-1', 'p1', {
        snapshotId: 'snap-1',
        tracks: [cachedTrack],
        total: 30,
        nextUrl: `${url}?offset=100`
      });

      const store = useTracksStore();
      store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });

      expect(store.tracks.map((t) => t.id)).toEqual([cachedTrack.id]);
      expect(store.nextUrl).toBe(`${url}?offset=100`);
    });

    it('ignores the cache when the playlist changed', () => {
      writePlaylistTracksCache('user-1', 'p1', {
        snapshotId: 'snap-1',
        tracks: [generateTrack()],
        total: 30,
        nextUrl: ''
      });

      const store = useTracksStore();
      store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-2', url, total: 31 });

      expect(store.tracks).toHaveLength(0);
      expect(store.nextUrl).toBe(url);
    });

    it('caches loaded pages', async () => {
      const store = useTracksStore();
      store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });
      const track = generateTrack();
      vi.spyOn(api, 'getTracks').mockResolvedValue({
        items: [{ item: track }],
        next: `${url}?offset=100`
      });

      await store.fetchTracks();

      const cached = readPlaylistTracksCache('user-1', 'p1', 'snap-1');
      expect(cached?.tracks.map((t) => t.id)).toEqual([track.id]);
      expect(cached?.nextUrl).toBe(`${url}?offset=100`);
    });

    describe('responses that arrive after switching playlists', () => {
      function pendingPage() {
        let resolve!: (value: unknown) => void;
        const promise = new Promise((r) => (resolve = r));
        return { promise, resolve };
      }

      it.each(['fetchTracks', 'fetchNextTracks'] as const)(
        '%s ignores a response for the previous playlist',
        async (action) => {
          const store = useTracksStore();
          const page = pendingPage();
          const getTracks = vi.spyOn(api, 'getTracks').mockReturnValueOnce(page.promise as any);
          store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });
          const loading = store[action]();

          // The footer clears the store, then another playlist is opened
          store.clearAllStates();
          store.openPlaylist({ playlistId: 'p2', snapshotId: 'snap-2', url: `${url}/p2`, total: 5 });
          page.resolve({ items: [{ item: generateTrack() }], next: `${url}?offset=100` });
          await loading;

          expect(store.tracks).toHaveLength(0);
          expect(store.nextUrl).toBe(`${url}/p2`);
          expect(readPlaylistTracksCache('user-1', 'p2', 'snap-2')).toBeNull();

          // The new playlist can load its own tracks
          const track = generateTrack();
          getTracks.mockResolvedValueOnce({ items: [{ item: track }], next: null } as any);
          await store.fetchTracks();
          expect(store.tracks.map((t) => t.id)).toEqual([track.id]);
        }
      );

      it('ignores a response for an earlier opening of the same playlist', async () => {
        const store = useTracksStore();
        const page = pendingPage();
        vi.spyOn(api, 'getTracks').mockReturnValueOnce(page.promise as any);
        store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });
        const loading = store.fetchTracks();

        store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });
        page.resolve({ items: [{ item: generateTrack() }], next: `${url}?offset=100` });
        await loading;

        expect(store.tracks).toHaveLength(0);
        expect(store.nextUrl).toBe(url);
      });

      it('ignores a failure for the previous playlist', async () => {
        const store = useTracksStore();
        let reject!: (error: unknown) => void;
        vi.spyOn(api, 'getTracks').mockReturnValueOnce(
          new Promise((_, r) => (reject = r)) as any
        );
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        store.openPlaylist({ playlistId: 'p1', snapshotId: 'snap-1', url, total: 30 });
        const loading = store.fetchTracks();

        store.openPlaylist({ playlistId: 'p2', snapshotId: 'snap-2', url: `${url}/p2`, total: 5 });
        reject(new Error('network'));
        await loading;

        expect(store.nextUrl).toBe(`${url}/p2`);
      });
    });
  });

  it('setSelectedTrackRandomly keeps working when every entry is the selected track', () => {
    const store = useTracksStore();
    const track = generateTrack();
    // A playlist can contain the same track more than once
    store.addTracks([track, track]);
    store.setSelectedTrack(track);

    expect(() => store.setSelectedTrackRandomly()).not.toThrow();
    expect(store.selectedTrack?.id).toBe(track.id);
  });

  it('setSelectedTrackRandomly does not pick the current track again (#80)', () => {
    const store = useTracksStore();
    const tracks = [generateTrack(), generateTrack()];
    store.addTracks(tracks);
    store.setSelectedTrack(tracks[0]);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    store.setSelectedTrackRandomly();
    expect(store.selectedTrack?.id).toBe(tracks[1].id);
  });
});
