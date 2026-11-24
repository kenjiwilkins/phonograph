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
    expect(albums.map((a) => a.id)).toContain(store.selectedAlbum?.id);
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

  describe('setSelectedAlbumRandomly (#125)', () => {
    it('keeps the only album selected instead of recursing forever', () => {
      const store = useUserSavedAlbumsStore();
      const album = generateAlbum();
      store.addAlbums([album]);
      store.setSelectedAlbum(album);

      expect(() => store.setSelectedAlbumRandomly()).not.toThrow();
      expect(store.selectedAlbum?.id).toBe(album.id);
    });

    it('picks a different album than the current one', () => {
      const store = useUserSavedAlbumsStore();
      const albums = [generateAlbum(), generateAlbum()];
      store.addAlbums(albums);
      store.setSelectedAlbum(albums[0]);
      vi.spyOn(Math, 'random').mockReturnValue(0);

      store.setSelectedAlbumRandomly();
      expect(store.selectedAlbum?.id).toBe(albums[1].id);
    });
  });

  describe('duplicate albums (#128)', () => {
    it('does not duplicate the first page when fetchUserSavedAlbums is called again', async () => {
      const firstPage = { items: [{ album: generateAlbum() }], total: 2, next: 'https://next-url' };
      (api.getUserSavedAlbums as any).mockResolvedValue(firstPage);

      const store = useUserSavedAlbumsStore();
      await store.fetchUserSavedAlbums();
      await store.fetchUserSavedAlbums();

      expect(store.albums).toHaveLength(1);
    });

    it('does not fetch the same next page concurrently', async () => {
      const store = useUserSavedAlbumsStore();
      store.setHasNext(true);
      store.setNextUrl('https://next-url');
      (api.getNextUserSavedAlbums as any).mockResolvedValue({
        items: [{ album: generateAlbum() }],
        next: null
      });

      await Promise.all([store.fetchNextUserSavedAlbums(), store.fetchNextUserSavedAlbums()]);

      expect(api.getNextUserSavedAlbums).toHaveBeenCalledTimes(1);
      expect(store.albums).toHaveLength(1);
    });

    it('skips albums that are already in the list', async () => {
      const store = useUserSavedAlbumsStore();
      const album = generateAlbum();
      store.addAlbums([album]);
      store.setHasNext(true);
      store.setNextUrl('https://next-url');
      (api.getNextUserSavedAlbums as any).mockResolvedValue({
        items: [{ album }, { album: generateAlbum() }],
        next: null
      });

      await store.fetchNextUserSavedAlbums();

      expect(store.albums).toHaveLength(2);
    });

    it('resets isLoading when the next page request fails', async () => {
      const store = useUserSavedAlbumsStore();
      store.setHasNext(true);
      store.setNextUrl('https://next-url');
      (api.getNextUserSavedAlbums as any).mockRejectedValue(new Error('network'));

      await store.fetchNextUserSavedAlbums();

      expect(store.isLoading).toBe(false);
      expect(store.hasNext).toBe(false);
    });

    it('fetchAllUserSavedAlbums waits for a next page that is already loading', async () => {
      const store = useUserSavedAlbumsStore();
      (api.getUserSavedAlbums as any).mockResolvedValue({
        items: [{ album: generateAlbum() }],
        total: 3,
        next: 'https://page-2'
      });
      await store.fetchUserSavedAlbums();

      let resolvePage2!: (value: unknown) => void;
      (api.getNextUserSavedAlbums as any)
        .mockImplementationOnce(() => new Promise((resolve) => (resolvePage2 = resolve)))
        .mockResolvedValueOnce({ items: [{ album: generateAlbum() }], next: null });
      (api.getUserSavedAlbums as any).mockResolvedValue({
        items: store.albums.map((album) => ({ album })),
        total: 3,
        next: 'https://page-2'
      });

      // A scroll-triggered request is in flight when "Play Random" starts fetching everything
      const scrollFetch = store.fetchNextUserSavedAlbums();
      const fetchAll = store.fetchAllUserSavedAlbums();
      await new Promise((resolve) => setTimeout(resolve, 0));
      resolvePage2({ items: [{ album: generateAlbum() }], next: 'https://page-3' });

      await Promise.all([scrollFetch, fetchAll]);
      expect(store.albums).toHaveLength(3);
      expect(store.hasNext).toBe(false);
    }, 1000);
  });
});
