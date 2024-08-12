import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import PlayConfirmModal from '@/components/PlayConfirmModal.vue';
import { generateAlbum, generateAlbums, generateTrack } from '../helpers';
import { flashPromise } from '../utils';

describe('PlayConfirmModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('renders correctly - selected album', () => {
    const selectedAlbum = generateAlbum();
    const { getByTestId, getByAltText } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                selectedAlbum: selectedAlbum
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-confirm-modal-overlay')).toBeTruthy();
    expect(getByAltText(selectedAlbum.name)).toBeTruthy();
    expect(getByTestId('play-confirm-modal-album-name').textContent).toContain(selectedAlbum.name);
    expect(getByTestId('play-confirm-modal-artist-name').textContent).toContain(
      selectedAlbum.artists[0].name
    );
  });
  test('renders correctly - selected track', () => {
    const selectedTrack = generateAlbum().tracks.items[0];
    const { getByTestId, getByAltText } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tracks: {
                selectedTrack: selectedTrack
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('play-confirm-modal-overlay')).toBeTruthy();
    expect(getByAltText(selectedTrack.album.name)).toBeTruthy();
    expect(getByTestId('play-confirm-modal-album-name').textContent).toContain(
      selectedTrack.album.name
    );
    expect(getByTestId('play-confirm-modal-artist-name').textContent).toContain(
      selectedTrack.artists[0].name
    );
  });
  test('functionality - play album', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: ''
      },
      writable: true
    });
    const selectedAlbum = generateAlbum();
    const { getByTestId } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                selectedAlbum: selectedAlbum
              }
            }
          })
        ]
      }
    });
    const playButton = getByTestId('play-confirm-modal-play-button');
    expect(playButton).toBeTruthy();
    await fireEvent.click(playButton);
    await flashPromise();
    expect(location.href).toContain(selectedAlbum.external_urls.spotify);
  });
  test('functionality - play track', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: ''
      },
      writable: true
    });
    const selectedTrack = generateAlbum().tracks.items[0];
    const { getByTestId } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tracks: {
                selectedTrack: selectedTrack
              }
            }
          })
        ]
      }
    });
    const playButton = getByTestId('play-confirm-modal-play-button');
    expect(playButton).toBeTruthy();
    await fireEvent.click(playButton);
    await flashPromise();
    expect(location.href).toContain(selectedTrack.album.external_urls.spotify);
  });
  test('functionality - next album', async () => {
    const albums = generateAlbums(2);
    const { getByTestId, getByAltText } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                selectedAlbum: albums[0],
                albums
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const nextButton = getByTestId('play-confirm-modal-next-button');
    expect(nextButton).toBeTruthy();
    await fireEvent.click(nextButton);
    await flashPromise();
    expect(getByAltText(albums[1].name)).toBeTruthy();
    expect(getByTestId('play-confirm-modal-album-name').textContent).toContain(albums[1].name);
    expect(getByTestId('play-confirm-modal-artist-name').textContent).toContain(
      albums[1].artists[0].name
    );
  });
  test('functionality - next track', async () => {
    const tracks = [generateTrack(), generateTrack()];
    const { getByTestId, getByAltText } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              tracks: {
                selectedTrack: tracks[0],
                tracks
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const nextButton = getByTestId('play-confirm-modal-next-button');
    expect(nextButton).toBeTruthy();
    await fireEvent.click(nextButton);
    await flashPromise();
    expect(getByAltText(tracks[1].album.name)).toBeTruthy();
    expect(getByTestId('play-confirm-modal-album-name').textContent).toContain(
      tracks[1].album.name
    );
    expect(getByTestId('play-confirm-modal-artist-name').textContent).toContain(
      tracks[1].artists[0].name
    );
  });
  test('functionality - close - album', async () => {
    const selectedAlbum = generateAlbum();
    const { getByTestId, queryByTestId } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                selectedAlbum: selectedAlbum
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const closeButton = getByTestId('play-confirm-modal-close-button');
    expect(closeButton).toBeTruthy();
    await fireEvent.click(closeButton);
    await flashPromise();
    expect(queryByTestId('play-confirm-modal')).not.toBeTruthy();
  });
  test('functionality - close - track', async () => {
    const selectedTrack = generateAlbum().tracks.items[0];
    const { getByTestId, queryByTestId } = render(PlayConfirmModal, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                selectedAlbum: null
              },
              tracks: {
                selectedTrack: selectedTrack
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const closeButton = getByTestId('play-confirm-modal-close-button');
    expect(closeButton).toBeTruthy();
    await fireEvent.click(closeButton);
    await flashPromise();
    expect(queryByTestId('play-confirm-modal')).not.toBeTruthy();
  });
});
