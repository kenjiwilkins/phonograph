import { render } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect } from 'vitest';
import type { User } from '@/types';
import AppBar from '@/components/AppBar.vue';
import { useUserStore } from '@/data';

const loggedInUser: User = {
  explicit_content: { filter_enabled: false, filter_locked: false },
  id: '1',
  display_name: 'test',
  email: '',
  external_urls: { spotify: '' },
  followers: { href: null, total: 0 },
  href: '',
  images: [
    {
      url: 'https://example.com',
      height: 640,
      width: 640
    }
  ],
  product: 'premium',
  country: 'JP',
  type: 'user',
  uri: ''
};

function renderLoggedIn(albumsLoading = false, user: User = loggedInUser) {
  return render(AppBar, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            user: { loggedInState: true, user },
            userSavedAlbums: { isLoading: albumsLoading }
          }
        })
      ]
    }
  });
}

describe('AppBar', () => {
  test('renders correctly with not-logged in', () => {
    const { getByTestId } = render(AppBar, {
      global: {
        plugins: [createTestingPinia()]
      }
    });
    useUserStore();
    expect(getByTestId('logo').textContent).toContain('PHONOGRAPH');
    expect(getByTestId('login-button').textContent).toContain('Login');
  });
  test('renders correctly with logged in', async () => {
    const { getByTestId, getByAltText } = renderLoggedIn();
    expect(getByTestId('user-button').textContent).toContain('test');
    getByAltText('test');
  });

  test('shows no link status and a LOGIN ghost button when logged out', () => {
    const { getByTestId, queryByTestId } = render(AppBar, {
      global: { plugins: [createTestingPinia()] }
    });
    expect(queryByTestId('link-status')).toBeNull();
    expect(getByTestId('login-button').classList).toContain('pg-btn--ghost');
  });

  test('shows LINK OK when logged in', () => {
    const { getByTestId } = renderLoggedIn();
    const status = getByTestId('link-status');
    expect(status.textContent?.trim()).toBe('Link ok');
    expect(status.classList).toContain('app-bar__status--ok');
    expect(status.getAttribute('role')).toBe('status');
  });

  test('shows SYNC while the saved albums are loading', () => {
    const { getByTestId } = renderLoggedIn(true);
    const status = getByTestId('link-status');
    expect(status.textContent?.trim()).toBe('Sync');
    expect(status.classList).toContain('app-bar__status--sync');
  });

  test('falls back to a placeholder avatar when the user has no image', () => {
    const { getByTestId, queryByRole } = renderLoggedIn(false, { ...loggedInUser, images: [] });
    expect(queryByRole('img')).toBeNull();
    expect(getByTestId('user-button').querySelector('.app-bar__avatar')).not.toBeNull();
  });
});
