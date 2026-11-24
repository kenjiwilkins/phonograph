import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSavedPlaylistsStore } from '@/data';
import { generatePlaylist, generatePlaylists } from '../helpers';
import * as api from '@/api';

vi.mock('@/api', () => ({
  getUserSavedPlaylists: vi.fn(),
  getNextUserSavedPlaylists: vi.fn()
}));

describe('UserSavedPlaylistsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initial state', () => {
    const store = useUserSavedPlaylistsStore();
    expect(store.playlists).toHaveLength(0);
    expect(store.selectedPlaylist).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.totalPlaylists).toBe(0);
    expect(store.hasNext).toBe(false);
  });

  it('actions - clearAllStates', () => {
    const store = useUserSavedPlaylistsStore();
    store.addPlaylists([generatePlaylist()]);
    store.setSelectedPlaylist(generatePlaylist());
    store.setNextUrl('https://next-url');
    store.setIsLoading(true);
    store.setTotalPlaylists(100);

    store.clearAllStates();

    expect(store.playlists).toHaveLength(0);
    expect(store.selectedPlaylist).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.totalPlaylists).toBe(0);
    expect(store.hasNext).toBe(false);
  });

  it('actions - addPlaylists and overwritePlaylists', () => {
    const store = useUserSavedPlaylistsStore();
    const playlists = Array.from({ length: 5 }, () => generatePlaylist());
    store.addPlaylists(playlists);
    expect(store.playlists).toHaveLength(5);

    const newPlaylists = Array.from({ length: 2 }, () => generatePlaylist());
    store.overwritePlaylists(newPlaylists);
    expect(store.playlists).toHaveLength(2);
  });

  it('actions - setSelectedPlaylist', () => {
    const store = useUserSavedPlaylistsStore();
    const playlist = generatePlaylist();
    store.setSelectedPlaylist(playlist);
    expect(store.selectedPlaylist).toEqual(playlist);
  });

  it('actions - clearSelectedPlaylist', () => {
    const store = useUserSavedPlaylistsStore();
    store.setSelectedPlaylist(generatePlaylist());
    store.clearSelectedPlaylist();
    expect(store.selectedPlaylist).toBeNull();
  });

  describe('Async actions', () => {
    it('fetchUserSavedPlaylists', async () => {
      const mockResponse = {
        items: [generatePlaylist()],
        total: 10,
        next: 'https://next-url'
      };
      (api.getUserSavedPlaylists as any).mockResolvedValue(mockResponse);

      const store = useUserSavedPlaylistsStore();
      await store.fetchUserSavedPlaylists();

      expect(store.playlists).toHaveLength(1);
      expect(store.totalPlaylists).toBe(10);
      expect(store.nextUrl).toBe('https://next-url');
      expect(store.hasNext).toBe(true);
    });

    it('fetchUserSavedPlaylists - handle error', async () => {
      (api.getUserSavedPlaylists as any).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const store = useUserSavedPlaylistsStore();
      await store.fetchUserSavedPlaylists();

      expect(store.isLoading).toBe(false);
      expect(store.playlists).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('pagination (#126)', () => {
    it('fetchNextUserSavedPlaylists appends the next page', async () => {
      const store = useUserSavedPlaylistsStore();
      store.addPlaylists(generatePlaylists(2));
      store.setNextUrl('https://api.spotify.com/v1/me/playlists?offset=50');
      const nextPage = generatePlaylists(3);
      (api.getNextUserSavedPlaylists as any).mockResolvedValue({ items: nextPage, next: null });

      await store.fetchNextUserSavedPlaylists();

      expect(api.getNextUserSavedPlaylists).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/playlists?offset=50'
      );
      expect(store.playlists).toHaveLength(5);
      expect(store.hasNext).toBe(false);
      expect(store.isLoading).toBe(false);
    });

    it('fetchNextUserSavedPlaylists does nothing without a next page', async () => {
      const store = useUserSavedPlaylistsStore();
      await store.fetchNextUserSavedPlaylists();
      expect(api.getNextUserSavedPlaylists).not.toHaveBeenCalled();
    });

    it('fetchNextUserSavedPlaylists skips playlists already in the list', async () => {
      const store = useUserSavedPlaylistsStore();
      const existing = generatePlaylists(1);
      store.addPlaylists(existing);
      store.setNextUrl('https://next');
      (api.getNextUserSavedPlaylists as any).mockResolvedValue({
        items: [...existing, ...generatePlaylists(1)],
        next: null
      });

      await store.fetchNextUserSavedPlaylists();
      expect(store.playlists).toHaveLength(2);
    });

    it('fetchUserSavedPlaylists replaces the list instead of appending', async () => {
      const store = useUserSavedPlaylistsStore();
      const firstPage = generatePlaylists(2);
      (api.getUserSavedPlaylists as any).mockResolvedValue({
        items: firstPage,
        total: 2,
        next: null
      });

      await store.fetchUserSavedPlaylists();
      await store.fetchUserSavedPlaylists();
      expect(store.playlists).toHaveLength(2);
    });
  });
});
