import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { MockIntersectionObserver } from '../helpers/intersectionObserver';
import PlaylistList from '@/components/PlaylistList.vue';
import { generatePlaylists, toNewPlaylistShape } from '../helpers';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';

describe('PlaylistList', () => {
  beforeEach(() => {
    MockIntersectionObserver.install();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  test('renders correctly - is loading', () => {
    const playlists = generatePlaylists(10);
    const { getByTestId } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: {
                playlists
              }
            }
          })
        ]
      }
    });
    for (let i = 0; i < playlists.length; i++) {
      const playlistName = getByTestId(`playlist-li-playlist-name-${i}`);
      expect(playlistName).toBeTruthy();
      expect(playlistName.textContent).toContain(playlists[i].name);
      const playlistTrackCount = getByTestId(`playlist-li-playlist-total-${i}`);
      expect(playlistTrackCount).toBeTruthy();
      expect(playlistTrackCount.textContent).toContain(String(playlists[i].tracks!.total));
    }
  });
  test('functionality - click', async () => {
    const playlists = generatePlaylists(10);
    const { getByTestId } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: {
                playlists
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const playlistStore = useUserSavedPlaylistsStore();
    const playlistItem = getByTestId('playlist-li-0');
    await fireEvent.click(playlistItem);
    expect(playlistStore.selectedPlaylist).toEqual(playlists[0]);
  });
  test('functionality - click sets the tracks url for random picks (#120)', async () => {
    const playlists = generatePlaylists(3);
    const { getByTestId } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedPlaylists: { playlists } },
            stubActions: false
          })
        ]
      }
    });
    const tracksStore = useTracksStore();
    await fireEvent.click(getByTestId('playlist-li-1'));
    expect(tracksStore.tracksUrl).toBe(
      `https://api.spotify.com/v1/playlists/${playlists[1].id}/items`
    );
    expect(tracksStore.totalTracks).toBe(playlists[1].tracks!.total);
  });
  test('functionality - loads more playlists when the end of the list is visible (#126)', async () => {
    const playlists = generatePlaylists(50);
    render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: {
                playlists,
                nextUrl: 'https://api.spotify.com/v1/me/playlists?offset=50'
              }
            },
            stubActions: false,
            createSpy: vi.fn
          })
        ]
      }
    });
    const store = useUserSavedPlaylistsStore();
    vi.spyOn(store, 'fetchUserSavedPlaylists').mockResolvedValue(undefined);
    const fetchNext = vi
      .spyOn(store, 'fetchNextUserSavedPlaylists')
      .mockImplementation(async () => store.setNextUrl(''));
    await flushPromises();

    MockIntersectionObserver.latest().trigger(true);
    await flushPromises();
    expect(fetchNext).toHaveBeenCalledTimes(1);
  });
  test('uses the /items endpoint when a playlist is selected (#131)', async () => {
    const playlist = toNewPlaylistShape({ ...generatePlaylists(1)[0], id: 'abc' }, { total: 7 });
    const { getByTestId } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedPlaylists: { playlists: [playlist] } },
            stubActions: false
          })
        ]
      }
    });
    expect(getByTestId('playlist-li-playlist-total-0').textContent).toContain('7 tracks');

    await fireEvent.click(getByTestId('playlist-li-0'));
    const tracksStore = useTracksStore();
    expect(tracksStore.tracksUrl).toBe('https://api.spotify.com/v1/playlists/abc/items');
    expect(tracksStore.nextUrl).toBe('https://api.spotify.com/v1/playlists/abc/items');
    expect(tracksStore.totalTracks).toBe(7);
  });
  test('marks playlists whose contents are not available and ignores clicks (#131)', async () => {
    const playlist = toNewPlaylistShape(generatePlaylists(1)[0]);
    const { getByTestId } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedPlaylists: { playlists: [playlist] } },
            stubActions: false
          })
        ]
      }
    });
    expect(getByTestId('playlist-li-playlist-total-0').textContent).toContain('not available');

    await fireEvent.click(getByTestId('playlist-li-0'));
    expect(useUserSavedPlaylistsStore().selectedPlaylist).toBeNull();
  });
  test('opens the playlist with its snapshot id so cached tracks can be reused (#80)', async () => {
    const playlist = { ...generatePlaylists(1)[0], snapshot_id: 'snap-9' };
    const { getByTestId } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedPlaylists: { playlists: [playlist] } },
            stubActions: false
          })
        ]
      }
    });
    const tracksStore = useTracksStore();
    const openPlaylist = vi.spyOn(tracksStore, 'openPlaylist');

    await fireEvent.click(getByTestId('playlist-li-0'));
    expect(openPlaylist).toHaveBeenCalledWith({
      playlistId: playlist.id,
      snapshotId: 'snap-9',
      url: `https://api.spotify.com/v1/playlists/${playlist.id}/items`,
      total: playlist.tracks!.total
    });
  });
});
