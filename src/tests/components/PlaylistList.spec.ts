import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect } from 'vitest';
import PlaylistList from '@/components/PlaylistList.vue';
import { generatePlaylists } from '../helpers';
import { useUserSavedPlaylistsStore } from '@/data';

describe('PlaylistList', () => {
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
});
