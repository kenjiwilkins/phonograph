import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { MockIntersectionObserver } from '../helpers/intersectionObserver';
import PlaylistList from '@/components/PlaylistList.vue';
import { generatePlaylists } from '../helpers';
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
      expect(playlistTrackCount.textContent).toContain(playlists[i].tracks.total);
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
    expect(tracksStore.tracksUrl).toBe(playlists[1].tracks.href);
    expect(tracksStore.totalTracks).toBe(playlists[1].tracks.total);
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
});
