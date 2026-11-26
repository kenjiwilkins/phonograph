import { fireEvent, render, screen } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { afterEach, describe, expect, test } from 'vitest';
import type { User } from '@/types';
import AccountMenu from '@/components/AccountMenu.vue';

const user: User = {
  id: 'listener-id',
  display_name: 'Listener',
  external_urls: { spotify: 'https://open.spotify.com/user/listener-id' },
  href: '',
  images: [{ url: 'https://example.com/avatar', height: 64, width: 64 }],
  type: 'user',
  uri: ''
};

function renderMenu({
  loading = false,
  profile = user as User | null,
  totalAlbums = 412,
  totalPlaylists = 24
} = {}) {
  return render(AccountMenu, {
    props: { loading },
    // Transitions and teleports are Vue's business; keep the menu in the rendered tree
    global: {
      stubs: { transition: true, teleport: true },
      plugins: [
        createTestingPinia({
          initialState: {
            user: { user: profile, loggedInState: !!profile },
            userSavedAlbums: { totalAlbums },
            userSavedPlaylists: { totalPlaylists }
          }
        })
      ]
    }
  });
}

const trigger = () => screen.getByTestId('user-button');
const dialog = () => screen.queryByTestId('account-menu');

async function openMenu() {
  trigger().focus();
  await fireEvent.click(trigger());
}

describe('AccountMenu (#198)', () => {
  const unmounts: (() => void)[] = [];
  // Attached to the document so focus can be asserted
  function mounted(options?: Parameters<typeof renderMenu>[0]) {
    unmounts.push(renderMenu(options).unmount);
  }
  afterEach(() => {
    unmounts.splice(0).forEach((unmount) => unmount());
    document.body.innerHTML = '';
  });

  test('opens a labelled dialog from the trigger and focuses it', async () => {
    mounted();
    expect(dialog()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');

    await openMenu();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('dialog', { name: '// Account' })).toBe(dialog());
    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(dialog());
  });

  test.each([
    ['the trigger', () => fireEvent.click(trigger())],
    ['Esc', () => fireEvent.keyDown(dialog() as Element, { key: 'Escape' })],
    ['the close button', () => fireEvent.click(screen.getByRole('button', { name: 'Close' }))],
    ['a click on the backdrop', () => fireEvent.click(screen.getByTestId('account-overlay'))]
  ])('closes with %s and returns focus to the trigger', async (_name, close) => {
    mounted();
    await openMenu();

    await close();

    expect(dialog()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  test('stays open on a click inside the dialog', async () => {
    mounted();
    await openMenu();
    await fireEvent.click(dialog() as Element);
    expect(dialog()).not.toBeNull();
  });

  test('keeps Tab inside the dialog', async () => {
    mounted();
    await openMenu();
    const close = screen.getByRole('button', { name: 'Close' });
    const link = screen.getByTestId('account-spotify-link');

    link.focus();
    await fireEvent.keyDown(link, { key: 'Tab' });
    expect(document.activeElement).toBe(close);

    await fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(link);
  });

  test('shows the profile, the Spotify link and the library totals', async () => {
    mounted();
    await openMenu();

    expect(screen.getByTestId('account-name').textContent?.trim()).toBe('Listener');
    expect(screen.getByTestId('account-id').textContent?.trim()).toBe('ID · listener-id');
    const link = screen.getByTestId('account-spotify-link');
    expect(link.getAttribute('href')).toBe(user.external_urls.spotify);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.textContent).toContain('(opens in a new tab)');
    expect(screen.getByTestId('account-stat-albums').textContent?.trim()).toBe('0412');
    expect(screen.getByTestId('account-stat-playlists').textContent?.trim()).toBe('0024');
  });

  test('shows dashes for totals that are not known yet', async () => {
    mounted({ totalPlaylists: 0 });
    await openMenu();
    expect(screen.getByTestId('account-stat-playlists').textContent?.trim()).toBe('----');
  });

  test('shows skeletons and still opens while the profile loads', async () => {
    mounted({ loading: true, profile: null, totalAlbums: 0, totalPlaylists: 0 });
    expect(trigger().getAttribute('aria-label')).toBe('Account menu');
    expect(screen.getByTestId('account-trigger-skeleton')).toBeTruthy();

    await openMenu();

    expect(screen.getByTestId('account-profile-skeleton')).toBeTruthy();
    expect(screen.queryByTestId('account-spotify-link')).toBeNull();
  });

  test('shows a placeholder for a missing avatar and keeps the whole long name in the DOM', async () => {
    const name = 'A listener with a very long display name that the trigger has to truncate';
    mounted({ profile: { ...user, display_name: name, images: [] } });
    await openMenu();

    expect(document.querySelectorAll('img')).toHaveLength(0);
    expect(document.querySelectorAll('.account-avatar--empty')).toHaveLength(2);
    expect(screen.getByTestId('account-name').textContent?.trim()).toBe(name);
  });
});
