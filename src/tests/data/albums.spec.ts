import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSavedAlbumsStore } from '@/data';
import { generateAlbum } from '../helpers';
import * as api from '@/api';

vi.mock('@/api', () => ({
  getUserSavedAlbums: vi.fn(),
  getNextUserSavedAlbums: vi.fn()
}));

describe('UserSavedAlbumsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initial state', () => {
    const store = useUserSavedAlbumsStore();
    expect(store.albums).toHaveLength(0);
    expect(store.selectedAlbum).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.hasNext).toBe(false);
    expect(store.totalAlbums).toBe(0);
  });

  it('actions - clearAllStates', () => {
    const store = useUserSavedAlbumsStore();
    store.addAlbums([generateAlbum()]);
    store.setSelectedAlbum(generateAlbum());
    store.setHasNext(true);
    store.setIsLoading(true);
    store.setTotalAlbums(100);

    store.clearAllStates();

    expect(store.albums).toHaveLength(0);
    expect(store.selectedAlbum).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.hasNext).toBe(false);
    expect(store.totalAlbums).toBe(0);
  });

  it('actions - addAlbums and overwriteAlbums', () => {
    const store = useUserSavedAlbumsStore();
    const albums = Array.from({ length: 5 }, () => generateAlbum());
    store.addAlbums(albums);
    expect(store.albums).toHaveLength(5);

    const newAlbums = Array.from({ length: 2 }, () => generateAlbum());
    store.overwriteAlbums(newAlbums);
    expect(store.albums).toHaveLength(2);
  });

  it('actions - setSelectedAlbumRandomly', () => {
    const store = useUserSavedAlbumsStore();
    const albums = Array.from({ length: 3 }, () => generateAlbum());
    store.addAlbums(albums);
    
    store.setSelectedAlbumRandomly();
    expect(store.selectedAlbum).not.toBeNull();
    // Compare by ID to avoid reference issues if cloned
    expect(albums.map(a => a.id)).toContain(store.selectedAlbum?.id);
  });

  describe('Async actions', () => {
    it('fetchUserSavedAlbums', async () => {
      const mockResponse = {
        items: [{ album: generateAlbum() }],
        total: 10,
        next: 'https://next-url'
      };
      (api.getUserSavedAlbums as any).mockResolvedValue(mockResponse);

      const store = useUserSavedAlbumsStore();
      await store.fetchUserSavedAlbums();

      expect(store.albums).toHaveLength(1);
      expect(store.totalAlbums).toBe(10);
      expect(store.hasNext).toBe(true);
      expect(store.nextUrl).toBe('https://next-url');
    });

    it('fetchNextUserSavedAlbums', async () => {
      const store = useUserSavedAlbumsStore();
      store.setHasNext(true);
      store.setNextUrl('https://next-url');

      const mockResponse = {
        items: [{ album: generateAlbum() }],
        next: null
      };
      (api.getNextUserSavedAlbums as any).mockResolvedValue(mockResponse);

      await store.fetchNextUserSavedAlbums();

      expect(store.albums).toHaveLength(1);
      expect(store.hasNext).toBe(false);
      expect(store.nextUrl).toBeNull();
    });

    it('fetchAllUserSavedAlbums', async () => {
      const mockFirstResponse = {
        items: [{ album: generateAlbum() }],
        total: 2,
        next: 'https://next-url'
      };
      const mockSecondResponse = {
        items: [{ album: generateAlbum() }],
        total: 2,
        next: null
      };
      (api.getUserSavedAlbums as any).mockResolvedValue(mockFirstResponse);
      (api.getNextUserSavedAlbums as any).mockResolvedValue(mockSecondResponse);

      const store = useUserSavedAlbumsStore();
      await store.fetchAllUserSavedAlbums();

      expect(store.albums).toHaveLength(2);
      expect(store.hasNext).toBe(false);
    });
  });
});
