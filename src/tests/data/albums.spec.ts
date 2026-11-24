import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { isReactive } from 'vue';
import { useUserSavedAlbumsStore, useUserStore } from '@/data';
import { readAlbumsCache, writeAlbumsCache } from '@/cache/libraryCache';
import type { User } from '@/types';
import { generateAlbum } from '../helpers';
import * as api from '@/api';

vi.mock('@/api', () => ({
  getUserSavedAlbums: vi.fn(),
  getNextUserSavedAlbums: vi.fn(),
  getUserSavedAlbumAt: vi.fn(),
  getSavedAlbumsHead: vi.fn()
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
  });

  describe('pickRandomAlbum (#120)', () => {
    it('fetches a single album at a random offset when not all albums are loaded', async () => {
      const store = useUserSavedAlbumsStore();
      store.addAlbums([generateAlbum()]);
      store.setTotalAlbums(1000);
      const album = generateAlbum();
      (api.getUserSavedAlbumAt as any).mockResolvedValue({ items: [{ album }], total: 1000 });
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      await store.pickRandomAlbum();

      expect(api.getUserSavedAlbumAt).toHaveBeenCalledTimes(1);
      expect(api.getUserSavedAlbumAt).toHaveBeenCalledWith(500);
      expect(store.selectedAlbum?.id).toBe(album.id);
    });

    it('picks from the loaded albums without a request when all albums are loaded', async () => {
      const store = useUserSavedAlbumsStore();
      const albums = [generateAlbum(), generateAlbum()];
      store.addAlbums(albums);
      store.setTotalAlbums(2);

      await store.pickRandomAlbum();

      expect(api.getUserSavedAlbumAt).not.toHaveBeenCalled();
      expect(albums.map((album) => album.id)).toContain(store.selectedAlbum?.id);
    });

    it('does not pick the same offset twice in a row', async () => {
      const store = useUserSavedAlbumsStore();
      store.setTotalAlbums(10);
      (api.getUserSavedAlbumAt as any).mockImplementation(async () => ({
        items: [{ album: generateAlbum() }],
        total: 10
      }));
      vi.spyOn(Math, 'random').mockReturnValue(0);

      await store.pickRandomAlbum();
      await store.pickRandomAlbum();

      const offsets = (api.getUserSavedAlbumAt as any).mock.calls.map(
        ([offset]: [number]) => offset
      );
      expect(offsets[0]).not.toBe(offsets[1]);
    });

    it('fetches the next offset when the random album is the current one', async () => {
      const store = useUserSavedAlbumsStore();
      const current = generateAlbum();
      const other = generateAlbum();
      store.setSelectedAlbum(current);
      store.setTotalAlbums(10);
      (api.getUserSavedAlbumAt as any)
        .mockResolvedValueOnce({ items: [{ album: current }], total: 10 })
        .mockResolvedValueOnce({ items: [{ album: other }], total: 10 });
      vi.spyOn(Math, 'random').mockReturnValue(0.3);

      await store.pickRandomAlbum();

      expect((api.getUserSavedAlbumAt as any).mock.calls).toEqual([[3], [4]]);
      expect(store.selectedAlbum?.id).toBe(other.id);
    });

    it('keeps the total in sync with the response', async () => {
      const store = useUserSavedAlbumsStore();
      store.setTotalAlbums(10);
      (api.getUserSavedAlbumAt as any).mockResolvedValue({
        items: [{ album: generateAlbum() }],
        total: 12
      });

      await store.pickRandomAlbum();
      expect(store.totalAlbums).toBe(12);
    });
  });

  describe('stored album shape (#121)', () => {
    it('keeps only the fields the UI needs', () => {
      const store = useUserSavedAlbumsStore();
      const album = generateAlbum();
      store.addAlbums([album]);

      const stored = store.albums[0];
      expect(stored).toEqual({
        id: album.id,
        name: album.name,
        images: album.images,
        artists: album.artists,
        external_urls: album.external_urls,
        uri: album.uri
      });
      expect(stored).not.toHaveProperty('tracks');
    });

    it('does not make stored albums deeply reactive', () => {
      const store = useUserSavedAlbumsStore();
      store.addAlbums([generateAlbum()]);
      expect(isReactive(store.albums[0])).toBe(false);
    });

    it('stores the randomly picked album in the same shape', async () => {
      const store = useUserSavedAlbumsStore();
      store.setTotalAlbums(10);
      (api.getUserSavedAlbumAt as any).mockResolvedValue({
        items: [{ album: generateAlbum() }],
        total: 10
      });

      await store.pickRandomAlbum();
      expect(store.selectedAlbum).not.toHaveProperty('tracks');
    });
  });

  describe('loadUserSavedAlbums (#80)', () => {
    const firstPage = (albums = [generateAlbum(), generateAlbum()], total = 120) => ({
      items: albums.map((album, i) => ({ album, added_at: `2026-11-0${i + 1}T00:00:00Z` })),
      total,
      next: 'https://api.spotify.com/v1/me/albums?offset=50&limit=50'
    });
    const head = (page: ReturnType<typeof firstPage>) => ({
      ...page,
      items: page.items.slice(0, 1)
    });

    beforeEach(() => {
      localStorage.clear();
      useUserStore().setUser({ id: 'user-1' } as User);
    });

    it('fetches the first page and caches it when nothing is cached', async () => {
      const page = firstPage();
      (api.getUserSavedAlbums as any).mockResolvedValue(page);

      await useUserSavedAlbumsStore().loadUserSavedAlbums();

      expect(api.getSavedAlbumsHead).not.toHaveBeenCalled();
      expect(readAlbumsCache('user-1')).toMatchObject({
        total: 120,
        nextUrl: page.next,
        fingerprint: {
          total: 120,
          firstId: page.items[0].album.id,
          firstAddedAt: page.items[0].added_at
        }
      });
    });

    it('shows cached albums immediately and keeps them when the library is unchanged', async () => {
      const page = firstPage();
      writeAlbumsCache('user-1', {
        albums: page.items.map((item) => item.album),
        total: 120,
        nextUrl: page.next,
        fingerprint: {
          total: 120,
          firstId: page.items[0].album.id,
          firstAddedAt: page.items[0].added_at
        }
      });
      let resolveHead!: (value: unknown) => void;
      (api.getSavedAlbumsHead as any).mockReturnValue(
        new Promise((resolve) => (resolveHead = resolve))
      );

      const store = useUserSavedAlbumsStore();
      const loading = store.loadUserSavedAlbums();
      // Rendered from the cache before the validation request returns
      expect(store.albums).toHaveLength(2);
      expect(store.totalAlbums).toBe(120);
      expect(store.nextUrl).toBe(page.next);
      expect(store.hasNext).toBe(true);

      resolveHead(head(page));
      await loading;
      expect(api.getUserSavedAlbums).not.toHaveBeenCalled();
      expect(store.albums).toHaveLength(2);
    });

    it('refetches the first page when an album was added', async () => {
      const page = firstPage();
      writeAlbumsCache('user-1', {
        albums: page.items.map((item) => item.album),
        total: 120,
        nextUrl: page.next,
        fingerprint: {
          total: 120,
          firstId: page.items[0].album.id,
          firstAddedAt: page.items[0].added_at
        }
      });
      const updated = firstPage([generateAlbum(), ...page.items.map((item) => item.album)], 121);
      (api.getSavedAlbumsHead as any).mockResolvedValue(head(updated));
      (api.getUserSavedAlbums as any).mockResolvedValue(updated);

      const store = useUserSavedAlbumsStore();
      await store.loadUserSavedAlbums();

      expect(api.getUserSavedAlbums).toHaveBeenCalledTimes(1);
      expect(store.albums).toHaveLength(3);
      expect(readAlbumsCache('user-1')?.total).toBe(121);
    });

    it('refetches the first page when an album was removed', async () => {
      const page = firstPage();
      writeAlbumsCache('user-1', {
        albums: page.items.map((item) => item.album),
        total: 120,
        nextUrl: page.next,
        fingerprint: {
          total: 120,
          firstId: page.items[0].album.id,
          firstAddedAt: page.items[0].added_at
        }
      });
      (api.getSavedAlbumsHead as any).mockResolvedValue({ ...head(page), total: 119 });
      (api.getUserSavedAlbums as any).mockResolvedValue({ ...page, total: 119 });

      await useUserSavedAlbumsStore().loadUserSavedAlbums();
      expect(api.getUserSavedAlbums).toHaveBeenCalledTimes(1);
    });

    it('keeps the cached albums when the validation request fails', async () => {
      const page = firstPage();
      writeAlbumsCache('user-1', {
        albums: page.items.map((item) => item.album),
        total: 120,
        nextUrl: page.next,
        fingerprint: {
          total: 120,
          firstId: page.items[0].album.id,
          firstAddedAt: page.items[0].added_at
        }
      });
      (api.getSavedAlbumsHead as any).mockRejectedValue(new Error('offline'));

      const store = useUserSavedAlbumsStore();
      await store.loadUserSavedAlbums();
      expect(store.albums).toHaveLength(2);
      expect(api.getUserSavedAlbums).not.toHaveBeenCalled();
    });

    it('adds the next page to the cache', async () => {
      const page = firstPage();
      (api.getUserSavedAlbums as any).mockResolvedValue(page);
      (api.getNextUserSavedAlbums as any).mockResolvedValue({
        items: [{ album: generateAlbum(), added_at: '2026-10-01T00:00:00Z' }],
        next: null
      });

      const store = useUserSavedAlbumsStore();
      await store.loadUserSavedAlbums();
      await store.fetchNextUserSavedAlbums();

      const cached = readAlbumsCache('user-1');
      expect(cached?.albums).toHaveLength(3);
      expect(cached?.nextUrl).toBe('');
      expect(cached?.fingerprint.firstId).toBe(page.items[0].album.id);
    });

    it('does not cache without a logged-in user', async () => {
      useUserStore().$reset();
      (api.getUserSavedAlbums as any).mockResolvedValue(firstPage());

      await useUserSavedAlbumsStore().loadUserSavedAlbums();
      expect(Object.keys({ ...localStorage })).toHaveLength(0);
    });
  });
});
