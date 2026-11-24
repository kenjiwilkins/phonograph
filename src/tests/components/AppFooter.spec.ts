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
  test('renders the three tabs in a labelled nav', () => {
    const { getByRole, getByTestId } = renderFooter();
    expect(getByRole('navigation', { name: 'Library' })).toBeTruthy();
    expect(getByTestId('album-span').textContent).toContain('Albums');
    expect(getByTestId('playlist-span').textContent).toContain('Playlists');
    const star = getByRole('link', { name: /Star me/ });
    expect(star.getAttribute('href')).toBe('https://github.com/kenjiwilkins/phonograph');
    expect(star.getAttribute('target')).toBe('_blank');
  });

  test('uses a star icon instead of the GitHub logo', () => {
    const { getByTestId, queryByAltText } = renderFooter();
    expect(getByTestId('github-star-icon').getAttribute('aria-hidden')).toBe('true');
    expect(queryByAltText('GitHub')).toBeNull();
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

  test('never marks the Star me link as current', () => {
    const { getByTestId } = renderFooter();
    expect(getByTestId('github-button').hasAttribute('aria-current')).toBe(false);
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
