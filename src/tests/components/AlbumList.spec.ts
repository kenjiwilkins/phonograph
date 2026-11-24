import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { MockIntersectionObserver } from '../helpers/intersectionObserver';
import AlbumList from '@/components/AlbumList.vue';
import { useUserSavedAlbumsStore } from '@/data';
import { generateAlbums } from '../helpers';

describe('AlbumList', () => {
  beforeEach(() => {
    MockIntersectionObserver.install();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
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
    expect(useUserSavedAlbumsStore().selectedAlbum?.id).toBe(albums[0].id);
  });
  test('functionality - loads the next page when the end of the list is visible (#122)', async () => {
    const albums = generateAlbums(10);
    render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedAlbums: { albums, hasNext: true } },
            stubActions: false,
            createSpy: vi.fn
          })
        ]
      }
    });
    const store = useUserSavedAlbumsStore();
    const fetchNext = vi
      .spyOn(store, 'fetchNextUserSavedAlbums')
      .mockImplementation(async () => store.setHasNext(false));
    await flushPromises();

    MockIntersectionObserver.latest().trigger(true);
    await flushPromises();
    expect(fetchNext).toHaveBeenCalledTimes(1);
  });
  test('functionality - does not listen to window scroll events (#122)', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedAlbums: { albums: generateAlbums(3), hasNext: true } }
          })
        ]
      }
    });
    const eventNames = addEventListener.mock.calls.map(([name]) => name);
    expect(eventNames).not.toContain('scroll');
    expect(eventNames).not.toContain('touchmove');
  });
  test('functionality - stops observing on unmount (#122)', async () => {
    const { unmount } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedAlbums: { albums: generateAlbums(3), hasNext: true } }
          })
        ]
      }
    });
    await flushPromises();
    const observer = MockIntersectionObserver.latest();
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
  test('renders the smallest suitable cover image (#123)', () => {
    const album = {
      ...generateAlbums(1)[0],
      images: [
        { url: 'https://i.scdn.co/large', width: 640, height: 640 },
        { url: 'https://i.scdn.co/medium', width: 300, height: 300 },
        { url: 'https://i.scdn.co/small', width: 64, height: 64 }
      ]
    };
    vi.stubGlobal('devicePixelRatio', 1);
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [createTestingPinia({ initialState: { userSavedAlbums: { albums: [album] } } })]
      }
    });
    expect(getByTestId('album-li-img-0').getAttribute('src')).toBe('https://i.scdn.co/small');
  });
  test('rows are real buttons reachable by keyboard (#160)', () => {
    const { getAllByRole } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({ initialState: { userSavedAlbums: { albums: generateAlbums(3) } } })
        ]
      }
    });
    const rows = getAllByRole('button');
    expect(rows).toHaveLength(3);
    rows.forEach((row) => expect(row.tagName).toBe('BUTTON'));
    expect(rows[2].textContent).toContain('#0003');
  });
  test('marks the album open in the play sheet as current (#160)', () => {
    const albums = generateAlbums(3);
    const { getByTestId } = render(AlbumList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { userSavedAlbums: { albums, selectedAlbum: albums[1] } }
          })
        ]
      }
    });
    expect(getByTestId('album-list-item-1').getAttribute('aria-current')).toBe('true');
    expect(getByTestId('album-list-item-0').hasAttribute('aria-current')).toBe(false);
  });
});
