import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import PlayConfirmModal from '@/components/PlayConfirmModal.vue';
import { generateAlbum, generateAlbums, generateTrack } from '../helpers';

describe('PlayConfirmModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly - selected album', async () => {
    const selectedAlbum = generateAlbum();
    const { getByAltText, getByTestId, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    expect(getByAltText(selectedAlbum.name)).toBeTruthy();
    expect(getByTestId('play-confirm-modal-album-name').textContent).toContain(selectedAlbum.name);
    expect(getByTestId('play-confirm-modal-artist-name').textContent).toContain(
      selectedAlbum.artists[0].name
    );
  });
  test('renders correctly - selected track', async () => {
    const selectedTrack = generateTrack();
    const { getByAltText, getByTestId, findByTestId } = render(PlayConfirmModal, {
      global: {
        stubs: { transition: false },
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
    await findByTestId('play-confirm-modal-overlay');
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
    const { getByTestId, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    const playButton = getByTestId('play-confirm-modal-play-button');
    expect(playButton).toBeTruthy();
    await fireEvent.click(playButton);
    expect(location.href).toContain(selectedAlbum.external_urls.spotify);
  });
  test('functionality - play track', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: ''
      },
      writable: true
    });
    const selectedTrack = generateTrack();
    const { getByTestId, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    const playButton = getByTestId('play-confirm-modal-play-button');
    expect(playButton).toBeTruthy();
    await fireEvent.click(playButton);
    expect(location.href).toContain(selectedTrack.album.external_urls.spotify);
  });
  test('functionality - next album', async () => {
    const albums = generateAlbums(2);
    const { getByTestId, getByAltText, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    const nextButton = getByTestId('play-confirm-modal-next-button');
    expect(nextButton).toBeTruthy();
    await fireEvent.click(nextButton);
    expect(getByAltText(albums[1].name)).toBeTruthy();
    expect(getByTestId('play-confirm-modal-album-name').textContent).toContain(albums[1].name);
    expect(getByTestId('play-confirm-modal-artist-name').textContent).toContain(
      albums[1].artists[0].name
    );
  });
  test('functionality - next track', async () => {
    const tracks = [generateTrack(), generateTrack()];
    const { getByTestId, getByAltText, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    const nextButton = getByTestId('play-confirm-modal-next-button');
    expect(nextButton).toBeTruthy();
    await fireEvent.click(nextButton);
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
    const { getByTestId, queryByTestId, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    const closeButton = getByTestId('play-confirm-modal-close-button');
    expect(closeButton).toBeTruthy();
    await fireEvent.click(closeButton);
    expect(queryByTestId('play-confirm-modal')).not.toBeTruthy();
  });
  test('functionality - close - track', async () => {
    const selectedTrack = generateTrack();
    const { getByTestId, queryByTestId, findByTestId } = render(PlayConfirmModal, {
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
    await findByTestId('play-confirm-modal-overlay');
    const closeButton = getByTestId('play-confirm-modal-close-button');
    expect(closeButton).toBeTruthy();
    await fireEvent.click(closeButton);
    expect(queryByTestId('play-confirm-modal')).not.toBeTruthy();
  });
});
