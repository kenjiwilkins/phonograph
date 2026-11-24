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
  test('shows "loading" while picking a random album (#132)', async () => {
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
    useUserSavedAlbumsStore().pickRandomAlbum = vi.fn(() => new Promise<void>(() => {}));
    const button = getByTestId('play-control-album-button');
    await fireEvent.click(button);
    expect(button.textContent).toContain('Loading');
  });

  test('shows the album readout padded to four digits with a meter (#159)', () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tab: { currentTab: TabType.ALBUM },
              userSavedAlbums: { albums: generateAlbums(12), totalAlbums: 48 }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-control-label').textContent).toBe('// 01 Library.albums');
    const count = getByTestId('play-control-count').textContent ?? '';
    expect(count).toContain('0012');
    expect(count).toContain('/ 0048');
    expect(count).toContain('12 of 48 albums loaded');
    expect(getByTestId('play-control-meter').style.width).toBe('25%');
    const button = getByTestId('play-control-album-button');
    expect(button.classList).toContain('pg-btn--primary');
    expect(button.textContent).toContain('Play random');
  });

  test('shows the playlist readout without a play button (#159)', () => {
    const { getByTestId, queryByRole } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tab: { currentTab: TabType.PLAYLIST },
              userSavedPlaylists: { playlists: generatePlaylists(3), totalPlaylists: 3 }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-control-label').textContent).toBe('// 02 Library.playlists');
    expect(getByTestId('play-control-count').textContent).toContain('0003');
    expect(getByTestId('play-control-meter').style.width).toBe('100%');
    expect(queryByRole('button')).toBeNull();
  });

  test('shows the track readout label (#159)', () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tab: { currentTab: TabType.PLAYLIST },
              tracks: { tracks: [generateTrack()], totalTracks: 7 }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-control-label').textContent).toBe('// 03 Playlist.tracks');
    expect(getByTestId('play-control-count').textContent).toContain('0001');
    expect(getByTestId('play-control-count').textContent).toContain('/ 0007');
  });

  test('shows dashes and a loading button before albums load (#159)', () => {
    const { getByTestId } = render(PlayControlArea, {
      global: {
        plugins: [createTestingPinia({ initialState: { tab: { currentTab: TabType.ALBUM } } })]
      }
    });
    expect(getByTestId('play-control-track')).toBeTruthy();
    expect(getByTestId('play-control-count').textContent).toContain('---- / ----');
    expect(getByTestId('play-control-meter').style.width).toBe('0%');
    const button = getByTestId('play-control-track-button');
    expect(button.textContent).toContain('Loading');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  test('shows dashes without a button while playlists load (#159)', () => {
    const { getByTestId, queryByRole } = render(PlayControlArea, {
      global: {
        plugins: [createTestingPinia({ initialState: { tab: { currentTab: TabType.PLAYLIST } } })]
      }
    });
    expect(getByTestId('play-control-label').textContent).toBe('// 02 Library.playlists');
    expect(getByTestId('play-control-count').textContent).toContain('---- / ----');
    expect(queryByRole('button')).toBeNull();
  });
});
