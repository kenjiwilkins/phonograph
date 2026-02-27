import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSavedPlaylistsStore } from '@/data';
import { generatePlaylist } from '../helpers';
import * as api from '@/api';

vi.mock('@/api', () => ({
  getUserSavedPlaylists: vi.fn()
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
});
