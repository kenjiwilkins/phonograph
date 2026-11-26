import { render, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi } from 'vitest';
import AppFooter from '@/components/AppFooter.vue';
import { useTabStore, TabType } from '@/data';
import { flashPromise } from '../utils';

function renderFooter(currentTab = TabType.ALBUM) {
  return render(AppFooter, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
          createSpy: vi.fn,
          initialState: {
            tab: {
              currentTab,
              tabs: [TabType.ALBUM, TabType.PLAYLIST]
            }
          }
        })
      ]
    }
  });
}

describe('AppFooter', () => {
  test('renders the two library tabs in a labelled nav', () => {
    const { getByRole, getByTestId, getAllByRole, queryByRole } = renderFooter();
    expect(getByRole('navigation', { name: 'Library' })).toBeTruthy();
    expect(getByTestId('album-span').textContent).toContain('Albums');
    expect(getByTestId('playlist-span').textContent).toContain('Playlists');
    expect(getAllByRole('button')).toHaveLength(2);
    // The GitHub link lives in the account menu (#199)
    expect(queryByRole('link')).toBeNull();
  });

  test('marks the current tab with aria-current', async () => {
    const { getByTestId } = renderFooter();
    const albumButton = getByTestId('album-button');
    const playlistButton = getByTestId('playlist-button');
    expect(albumButton.getAttribute('aria-current')).toBe('page');
    expect(playlistButton.hasAttribute('aria-current')).toBe(false);

    useTabStore().setCurrentTab(TabType.PLAYLIST);
    await flashPromise();
    expect(albumButton.hasAttribute('aria-current')).toBe(false);
    expect(playlistButton.getAttribute('aria-current')).toBe('page');
  });

  test('switches tabs on click', async () => {
    const { getByTestId } = renderFooter();
    const albumButton = getByTestId('album-button');
    const playlistButton = getByTestId('playlist-button');

    await fireEvent.click(playlistButton);
    expect(useTabStore().currentTab).toBe(TabType.PLAYLIST);
    expect(playlistButton.getAttribute('aria-current')).toBe('page');
    expect(albumButton.hasAttribute('aria-current')).toBe(false);

    await fireEvent.click(albumButton);
    expect(useTabStore().currentTab).toBe(TabType.ALBUM);
    expect(albumButton.getAttribute('aria-current')).toBe('page');

    // Clicking the current tab again keeps it selected
    await fireEvent.click(albumButton);
    expect(albumButton.getAttribute('aria-current')).toBe('page');
  });
});
