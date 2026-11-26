import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getSavedAlbumsHead, getSavedPlaylistsHead } from '@/api';
import { useLibraryTotalsStore, useUserSavedAlbumsStore, useUserSavedPlaylistsStore } from '@/data';

vi.mock('@/api', () => ({
  getSavedAlbumsHead: vi.fn(),
  getSavedPlaylistsHead: vi.fn()
}));

describe('library totals (#211)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(getSavedAlbumsHead).mockResolvedValue({ total: 412 });
    vi.mocked(getSavedPlaylistsHead).mockResolvedValue({ total: 0 });
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('fetches the unknown totals, once even when asked twice', async () => {
    const totals = useLibraryTotalsStore();

    await Promise.all([totals.fetchMissing(), totals.fetchMissing()]);
    await totals.fetchMissing();

    expect(getSavedAlbumsHead).toHaveBeenCalledTimes(1);
    expect(getSavedPlaylistsHead).toHaveBeenCalledTimes(1);
    expect(totals.albums).toBe(412);
    expect(totals.playlists).toBe(0);
  });

  test('follows the list stores and survives their reset on a tab switch', async () => {
    const totals = useLibraryTotalsStore();
    useUserSavedAlbumsStore().setTotalAlbums(7);
    useUserSavedPlaylistsStore().setTotalPlaylists(3);

    useUserSavedAlbumsStore().clearAllStates();
    useUserSavedPlaylistsStore().clearAllStates();
    await totals.fetchMissing();

    expect(totals.albums).toBe(7);
    expect(totals.playlists).toBe(3);
    expect(getSavedAlbumsHead).not.toHaveBeenCalled();
    expect(getSavedPlaylistsHead).not.toHaveBeenCalled();
  });

  test('keeps a failed total unknown and tries it again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getSavedPlaylistsHead).mockRejectedValueOnce(new Error('offline'));
    const totals = useLibraryTotalsStore();

    await totals.fetchMissing();
    expect(totals.albums).toBe(412);
    expect(totals.playlists).toBeNull();

    await totals.fetchMissing();
    expect(totals.playlists).toBe(0);
    expect(getSavedAlbumsHead).toHaveBeenCalledTimes(1);
  });
});
