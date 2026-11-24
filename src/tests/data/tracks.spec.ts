import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTracksStore } from '@/data/tracks';
import { Track } from '@/types';
import * as api from '@/api';
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
    expect(store.tracks).toEqual(tracks);
  });

  it('should overwrite tracks', () => {
    const store = useTracksStore();
    const initialTracks = [generateTrack()];
    store.addTracks(initialTracks);
    const newTracks = [generateTrack(), generateTrack()];
    store.overwriteTracks(newTracks);
    expect(store.tracks).toHaveLength(2);
    expect(store.tracks).toEqual(newTracks);
  });

  it('should set selected track', () => {
    const store = useTracksStore();
    const track = generateTrack();
    store.setSelectedTrack(track);
    expect(store.selectedTrack).toEqual(track);
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
    expect(store.selectedTrack).toEqual(track);
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
});
