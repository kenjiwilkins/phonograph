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
  type: 'track',
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
    expect(tracks.map(t => t.id)).toContain(store.selectedTrack?.id);
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
      items: [
        { track: generateTrack() },
        { track: generateTrack() }
      ],
      next: faker.internet.url(),
      total: 10,
      limit: 2,
      offset: 0,
      href: faker.internet.url(),
      previous: null,
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
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

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

    it('should fetch all tracks', async () => {
      const store = useTracksStore();
      store.setNextUrl('http://api.spotify.com/v1/me/tracks');
      // fetchAllTracks requires existing tracks to proceed
      store.addTracks([generateTrack()]);

      // First call returns data and a next URL
      const firstResponse = { ...mockTracksResponse, next: 'http://api.spotify.com/v1/me/tracks?offset=2' };
      // Second call returns data and no next URL
      const secondResponse = { ...mockTracksResponse, next: null };

      const getTracksSpy = vi.spyOn(api, 'getTracks')
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      await store.fetchAllTracks();

      expect(getTracksSpy).toHaveBeenCalledTimes(2);
      // 1 initial + 2 from first response + 2 from second response = 5
      expect(store.tracks).toHaveLength(5);
      expect(store.nextUrl).toBe('');
    });

    it('should reject when user cancels (selectedTrack set)', async () => {
      const store = useTracksStore();
      store.setNextUrl('http://api.spotify.com/v1/me/tracks');
      store.addTracks([generateTrack()]); // Add initial tracks

      vi.spyOn(api, 'getTracks').mockImplementation(async () => {
        store.setSelectedTrack(generateTrack()); // Simulate user selection during fetch
        return mockTracksResponse;
      });

      await expect(store.fetchAllTracks()).rejects.toBe('User cancelled');
    });

    it('should fetch all tracks starting with empty list', async () => {
      const store = useTracksStore();
      store.setNextUrl('http://api.spotify.com/v1/me/tracks');
      // Ensure tracks is empty
      expect(store.tracks).toHaveLength(0);

      // First call returns data and a next URL
      const firstResponse = { ...mockTracksResponse, next: 'http://api.spotify.com/v1/me/tracks?offset=2' };
      // Second call returns data and no next URL
      const secondResponse = { ...mockTracksResponse, next: null };

      const getTracksSpy = vi.spyOn(api, 'getTracks')
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      await store.fetchAllTracks();

      expect(getTracksSpy).toHaveBeenCalledTimes(2);
      expect(store.tracks).toHaveLength(4);
      expect(store.nextUrl).toBe('');
    });
  });
});
