import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect } from 'vitest';
import PlaylistHeader from '@/components/PlaylistHeader.vue';
import { useTracksStore, useUserSavedPlaylistsStore } from '@/data';
import { generatePlaylist, generateTrack } from '../helpers';

describe('PlaylistHeader (#161)', () => {
  test('renders nothing when no playlist is open', () => {
    const { queryByTestId } = render(PlaylistHeader, {
      global: { plugins: [createTestingPinia()] }
    });
    expect(queryByTestId('playlist-header')).toBeNull();
  });

  test('shows a back button with the playlist name and an OPEN tag', () => {
    const playlist = generatePlaylist();
    const { getByRole, getByText } = render(PlaylistHeader, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedPlaylists: { selectedPlaylist: playlist } }
          })
        ]
      }
    });
    const back = getByRole('button', { name: `Back to playlists: ${playlist.name}` });
    expect(back.getAttribute('type')).toBe('button');
    expect(getByText('Open').classList).toContain('pg-tag--mint');
  });

  test('going back closes the playlist and clears its tracks', async () => {
    const { getByTestId } = render(PlaylistHeader, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              userSavedPlaylists: { selectedPlaylist: generatePlaylist() },
              tracks: { tracks: [generateTrack()], totalTracks: 1 }
            }
          })
        ]
      }
    });
    await fireEvent.click(getByTestId('playlist-back-button'));
    expect(useUserSavedPlaylistsStore().selectedPlaylist).toBeNull();
    expect(useTracksStore().tracks).toHaveLength(0);
  });
});
