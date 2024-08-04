import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi } from 'vitest';
import AlbumList from '@/components/AlbumList.vue';
import { useUserSavedAlbumsStore } from '@/data';
import { generateAlbums } from '../helpers';

describe('AlbumList', () => {
  test('renders correctly - is loading', () => {
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                isLoading: true
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('content-placeholder')).toBeTruthy();
    expect(getByTestId('loading')).toBeTruthy();
  });
  test('renders correctly - has albums', () => {
    const ALBUMS_LENGTH = 10;
    const albums = generateAlbums(ALBUMS_LENGTH);
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                isLoading: false,
                albums
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('album-list')).toBeTruthy();
    for (let i = 0; i < ALBUMS_LENGTH; i++) {
      const album = getByTestId(`album-list-item-${i}`);
      expect(album).toBeTruthy();
      expect(getByTestId(`album-li-name-${i}`).textContent).toContain(albums[i].name);
      expect(getByTestId(`album-li-artist-${i}`).textContent).toContain(albums[i].artists[0].name);
    }
  });
  test('functionality - click', async () => {
    const ALBUMS_LENGTH = 10;
    const albums = generateAlbums(ALBUMS_LENGTH);
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                isLoading: false,
                albums
              }
            },
            stubActions: false
          })
        ]
      }
    });
    const albumListItem = getByTestId('album-list-item-0');
    await fireEvent.click(albumListItem);
    expect(useUserSavedAlbumsStore().selectedAlbum).toEqual(albums[0]);
  });
  test('functionality - scroll', async () => {
    const ALBUMS_LENGTH = 10;
    const albums = generateAlbums(ALBUMS_LENGTH);
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              userSavedAlbums: {
                isLoading: false,
                albums,
                hasNext: true
              }
            },
            stubActions: false,
            createSpy: vi.fn
          })
        ]
      }
    });
    vi.spyOn(useUserSavedAlbumsStore(), 'fetchUserSavedAlbums').mockResolvedValue(undefined);
    await fireEvent.scroll(window, { target: { scrollY: 1000 } });
    const loading = getByTestId('loading');
    expect(loading).toBeTruthy();
    await fireEvent.scroll(window, { target: { scrollY: 1000 } });
    await fireEvent.scroll(window, { target: { scrollY: 1000 } });
  });
});
