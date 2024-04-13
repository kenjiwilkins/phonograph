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
  test('functionality - album - all albums fetched', async () => {
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
                totalAlbums: 10
              }
            }
          })
        ]
      }
    });
    const albumStore = useUserSavedAlbumsStore();
    albumStore.fetchAllUserSavedAlbums = vi.fn();
    albumStore.setSelectedAlbumRandomly = vi.fn();
    const album = getByTestId('play-control-album-button');
    await fireEvent.click(album);
    expect(albumStore.fetchAllUserSavedAlbums).not.toHaveBeenCalled();
    expect(albumStore.setSelectedAlbumRandomly).toHaveBeenCalled();
  });
  test('functionality - album - not all albums fetched', async () => {
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
  test('functionality - album - no multiple fetch', async () => {
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
    // delay the fetchAllUserSavedAlbums function
    albumStore.fetchAllUserSavedAlbums = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, 1000);
      });
    });
    const album = getByTestId('play-control-album-button');
    await fireEvent.click(album);
    await fireEvent.click(album);
    expect(albumStore.fetchAllUserSavedAlbums).toHaveBeenCalledTimes(1);
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
  test('functionality - track - not all tracks fetched', async () => {
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
  test('functionality - track all tracks fetched', async () => {
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
                tracks: [generateTrack(), generateTrack()],
                totalTracks: 2
              }
            }
          })
        ]
      }
    });
    const trackStore = useTracksStore();
    trackStore.fetchAllTracks = vi.fn();
    trackStore.setSelectedTrackRandomly = vi.fn();
    const track = getByTestId('play-control-track-button');
    await fireEvent.click(track);
    expect(trackStore.fetchAllTracks).not.toHaveBeenCalled();
    expect(trackStore.setSelectedTrackRandomly).toHaveBeenCalled();
  });
  test('functionality - track no multiple fetch', async () => {
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
                totalTracks: 2
              }
            }
          })
        ]
      }
    });
    const trackStore = useTracksStore();
    // delay the fetchAllTracks function
    trackStore.fetchAllTracks = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, 1000);
      });
    });
    const track = getByTestId('play-control-track-button');
    await fireEvent.click(track);
    await fireEvent.click(track);
    expect(trackStore.fetchAllTracks).toHaveBeenCalledTimes(1);
  });
});
