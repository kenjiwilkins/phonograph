import { render } from '@testing-library/vue';
import { fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi } from 'vitest';
import AppFooter from '@/components/AppFooter.vue';
import { useTabStore, TabType } from '@/data';
import { flashPromise } from '../utils';

describe('AppFooter', () => {
  test('renders correctly', () => {
    const { getByTestId } = render(AppFooter, {
      global: {
        plugins: [createTestingPinia()]
      }
    });
    expect(getByTestId('album-span').textContent).toContain('Albums');
    expect(getByTestId('playlist-span').textContent).toContain('Playlists');
  });
  test('renders correctly with selected album', async () => {
    const { getByTestId } = render(AppFooter, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
            initialState: {
              tab: {
                currentTab: TabType.ALBUM,
                tabs: [TabType.ALBUM, TabType.PLAYLIST]
              }
            }
          })
        ]
      }
    });
    useTabStore().currentTab = TabType.ALBUM;
    const albumIcon = getByTestId('album-icon');
    const albumSpan = getByTestId('album-span');
    const playlistIcon = getByTestId('playlist-icon');
    const playlistSpan = getByTestId('playlist-span');
    expect(albumIcon.classList).toContain('fill-green-500');
    expect(albumSpan.classList).toContain('text-green-500');
    expect(playlistIcon.classList).toContain('fill-white');
    expect(playlistSpan.classList).toContain('text-white');
    useTabStore().setCurrentTab(TabType.PLAYLIST);
    await flashPromise();
    expect(albumIcon.classList).toContain('fill-white');
    expect(albumSpan.classList).toContain('text-white');
    expect(playlistIcon.classList).toContain('fill-green-500');
    expect(playlistSpan.classList).toContain('text-green-500');
  });
  test('functionality', async () => {
    const { getByTestId } = render(AppFooter, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
            initialState: {
              tab: {
                currentTab: TabType.ALBUM,
                tabs: [TabType.ALBUM, TabType.PLAYLIST]
              }
            }
          })
        ]
      }
    });
    const albumButton = getByTestId('album-button');
    const playlistButton = getByTestId('playlist-button');
    const albumSpan = getByTestId('album-span');
    const playlistSpan = getByTestId('playlist-span');
    expect(albumSpan.classList).toContain('text-green-500');
    expect(playlistSpan.classList).toContain('text-white');
    await fireEvent.click(playlistButton);
    expect(albumSpan.classList).toContain('text-white');
    expect(playlistSpan.classList).toContain('text-green-500');
    await fireEvent.click(albumButton);
    expect(albumSpan.classList).toContain('text-green-500');
    await fireEvent.click(albumButton);
    expect(albumSpan.classList).toContain('text-green-500');
  });
});
