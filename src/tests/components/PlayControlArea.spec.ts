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
  test('functionality - album', async () => {
    const albums = generateAlbums(10);
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              tab: {
                currentTab: TabType.ALBUM
              },
              userSavedAlbums: {
                albums,
                totalAlbums: 100
              }
            }
          })
        ]
      }
    });
    const albumStore = useUserSavedAlbumsStore();
    albumStore.fetchAllUserSavedAlbums = vi.fn();
    const album = getByTestId('play-control-album-button');
    await fireEvent.click(album);
    expect(albumStore.fetchAllUserSavedAlbums).toHaveBeenCalled();
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
  test('functionality - track', async () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              userSavedAlbums: {
                albums: []
              },
              userSavedPlaylists: {
                playlists: []
              },
              tracks: {
                tracks: [generateTrack()],
                totalTracks: 100
              }
            }
          })
        ]
      }
    });
    const trackStore = useTracksStore();
    trackStore.fetchAllTracks = vi.fn();
    const track = getByTestId('play-control-track-button');
    await fireEvent.click(track);
    expect(trackStore.fetchAllTracks).toHaveBeenCalled();
  });
});
