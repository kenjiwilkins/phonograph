import { render } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import AlbumList from '@/components/AlbumList.vue';
import PlaylistList from '@/components/PlaylistList.vue';
import TrackList from '@/components/TrackList.vue';
import PlayConfirmModal from '@/components/PlayConfirmModal.vue';
import { generateAlbum, generatePlaylist, generateTrack } from '../helpers';
import { MockIntersectionObserver } from '../helpers/intersectionObserver';
import { useTracksStore } from '@/data';
import playlistIcon from '@assets/playlists.svg';

// Regression tests for #127: Spotify data with missing images, artists or tracks
describe('missing data (#127)', () => {
  let warn: MockInstance<typeof console.warn>;
  beforeEach(() => {
    MockIntersectionObserver.install();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('AlbumList renders an album without images or artists', () => {
    const album = { ...generateAlbum(), images: [], artists: [] };
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [createTestingPinia({ initialState: { userSavedAlbums: { albums: [album] } } })]
      }
    });
    expect(getByTestId('album-li-name-0').textContent).toContain(album.name);
    // The cover falls back to the placeholder instead of an <img> without a src
    expect(getByTestId('album-li-img-0').tagName).not.toBe('IMG');
  });

  test('PlaylistList shows the playlist icon when images is an empty array', () => {
    const playlist = { ...generatePlaylist(), images: [] };
    const { container } = render(PlaylistList, {
      global: {
        plugins: [
          createTestingPinia({ initialState: { userSavedPlaylists: { playlists: [playlist] } } })
        ]
      }
    });
    expect(container.querySelector('img')?.getAttribute('src')).toBe(playlistIcon);
  });

  test('PlaylistList handles images: null', () => {
    const playlist = { ...generatePlaylist(), images: null };
    expect(() =>
      render(PlaylistList, {
        global: {
          plugins: [
            createTestingPinia({ initialState: { userSavedPlaylists: { playlists: [playlist] } } })
          ]
        }
      })
    ).not.toThrow();
  });

  test('TrackList renders the same track twice without duplicate keys', async () => {
    const track = generateTrack();
    const { getAllByRole } = render(TrackList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: { selectedPlaylist: generatePlaylist() },
              tracks: { tracks: [generateTrack()] }
            }
          })
        ]
      }
    });
    // Vue only reports duplicate keys when the list is patched, so update it after mounting
    useTracksStore().tracks = [track, generateTrack(), track];
    await flushPromises();

    expect(getAllByRole('button')).toHaveLength(3);
    const duplicateKeyWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes('Duplicate keys')
    );
    expect(duplicateKeyWarnings).toHaveLength(0);
  });

  test('TrackList renders a track without album images or artists', () => {
    const track = generateTrack();
    const broken = { ...track, artists: [], album: { ...track.album, images: [] } };
    const { getByTestId } = render(TrackList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedPlaylists: { selectedPlaylist: generatePlaylist() },
              tracks: { tracks: [broken] }
            }
          })
        ]
      }
    });
    expect(getByTestId('track-li-name-0').textContent).toContain(track.name);
  });

  test('PlayConfirmModal renders an album without images or artists', async () => {
    const album = { ...generateAlbum(), images: [], artists: [] };
    const { findByTestId } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({ initialState: { userSavedAlbums: { selectedAlbum: album } } })
        ]
      }
    });
    expect((await findByTestId('play-confirm-modal-album-name')).textContent).toContain(album.name);
  });
});
