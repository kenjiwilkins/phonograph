import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import PlayControlArea from '@/components/PlayControlArea.vue';
import { TabType, useTracksStore, useUserSavedAlbumsStore } from '@/data';
import { generateAlbums, generatePlaylists, generateTrack } from '../helpers';

describe('PlayControlArea', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('renders correctly - album selected', () => {
    const albums = generateAlbums(10);
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tab: {
                currentTab: TabType.ALBUM
              },
              userSavedAlbums: {
                albums
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-control-album')).toBeTruthy();
  });
  test('functionality - album - picks a random album (#120)', async () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              tab: { currentTab: TabType.ALBUM },
              userSavedAlbums: { albums: generateAlbums(10), totalAlbums: 100 }
            }
          })
        ]
      }
    });
    const albumStore = useUserSavedAlbumsStore();
    albumStore.pickRandomAlbum = vi.fn();
    await fireEvent.click(getByTestId('play-control-album-button'));
    expect(albumStore.pickRandomAlbum).toHaveBeenCalledTimes(1);
  });
  test('functionality - album - no multiple fetch', async () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              tab: { currentTab: TabType.ALBUM },
              userSavedAlbums: { albums: generateAlbums(10), totalAlbums: 100 }
            }
          })
        ]
      }
    });
    const albumStore = useUserSavedAlbumsStore();
    albumStore.pickRandomAlbum = vi.fn(() => new Promise<void>(() => {}));
    const button = getByTestId('play-control-album-button');
    await fireEvent.click(button);
    await fireEvent.click(button);
    expect(albumStore.pickRandomAlbum).toHaveBeenCalledTimes(1);
  });
  test('renders correctly - playlist selected', () => {
    const playlists = generatePlaylists(10);
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tab: {
                currentTab: TabType.PLAYLIST
              },
              userSavedPlaylists: {
                playlists
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-control-playlist')).toBeTruthy();
  });
  test('renders correctly - track selected', () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tracks: {
                tracks: [generateTrack()]
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-control-track')).toBeTruthy();
  });
  test('functionality - track - picks a random track (#120)', async () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              userSavedAlbums: { albums: [] },
              userSavedPlaylists: { playlists: [] },
              tracks: { tracks: [generateTrack()], totalTracks: 100 }
            }
          })
        ]
      }
    });
    const trackStore = useTracksStore();
    trackStore.pickRandomTrack = vi.fn();
    await fireEvent.click(getByTestId('play-control-track-button'));
    expect(trackStore.pickRandomTrack).toHaveBeenCalledTimes(1);
  });
  test('functionality - track no multiple fetch', async () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              userSavedAlbums: { albums: [] },
              userSavedPlaylists: { playlists: [] },
              tracks: { tracks: [generateTrack()], totalTracks: 2 }
            }
          })
        ]
      }
    });
    const trackStore = useTracksStore();
    trackStore.pickRandomTrack = vi.fn(() => new Promise<void>(() => {}));
    const button = getByTestId('play-control-track-button');
    await fireEvent.click(button);
    await fireEvent.click(button);
    expect(trackStore.pickRandomTrack).toHaveBeenCalledTimes(1);
  });
});
