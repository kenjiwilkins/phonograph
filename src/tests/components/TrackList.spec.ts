import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi } from 'vitest';
import TrackList from '@/components/TrackList.vue';
import { generateTrack, generatePlaylist } from '../helpers';
import { useTracksStore } from '@/data';

describe('TrackList', () => {
  test('renders correctly', () => {
    const tracks = [generateTrack(), generateTrack()];
    const { getByTestId } = render(TrackList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: {
                selectedPlaylist: generatePlaylist()
              },
              tracks: {
                tracks
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('track-list')).toBeTruthy();
    for (let i = 0; i < tracks.length; i++) {
      const track = getByTestId(`track-li-name-${i}`);
      expect(track).toBeTruthy();
      expect(track.textContent).toContain(tracks[i].name);
      const trackAlbum = getByTestId(`track-li-album-${i}`);
      expect(trackAlbum).toBeTruthy();
      expect(trackAlbum.textContent).toContain(tracks[i].album.name);
      const trackArtist = getByTestId(`track-li-artist-${i}`);
      expect(trackArtist).toBeTruthy();
      expect(trackArtist.textContent).toContain(tracks[i].artists[0].name);
    }
  });
  test('functionality - click', async () => {
    const tracks = [generateTrack(), generateTrack()];
    const { getByTestId } = render(TrackList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: {
                selectedPlaylist: generatePlaylist()
              },
              tracks: {
                tracks
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const trackStore = useTracksStore();
    trackStore.setSelectedTrack = vi.fn();
    const trackItem = getByTestId('track-li-0');
    await fireEvent.click(trackItem);
    expect(trackStore.setSelectedTrack).toHaveBeenCalled();
  });
  test('shows album and artist on one meta line and marks the open track (#161)', () => {
    const tracks = [generateTrack(), generateTrack()];
    const { getByTestId, getAllByRole } = render(TrackList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: { selectedPlaylist: generatePlaylist() },
              tracks: { tracks, selectedTrack: tracks[1] }
            }
          })
        ]
      }
    });
    const meta = getByTestId('track-li-album-0').parentElement!;
    expect(meta.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      `${tracks[0].album.name} · ${tracks[0].artists[0].name}`
    );
    const rows = getAllByRole('button');
    expect(rows[0].hasAttribute('aria-current')).toBe(false);
    expect(rows[1].getAttribute('aria-current')).toBe('true');
  });
});
