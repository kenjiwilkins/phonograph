import { render } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from '@/App.vue';
import * as auth from '@/auth';
import { useUserStore } from '@/data';

vi.mock('@/auth', () => ({
  useAuth: vi.fn()
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders LandingSection when loading (not authenticated)', async () => {
    (auth.useAuth as any).mockResolvedValue({
      isAuthenticated: false,
      needsAuth: true
    });

    const { findByText } = render(App, {
      global: {
        plugins: [createTestingPinia()]
      }
    });

    expect(await findByText('Get Started')).toBeTruthy();
  });

  test('renders main content when authenticated', async () => {
    (auth.useAuth as any).mockResolvedValue({
      isAuthenticated: true,
      accessToken: 'mock-token'
    });

    const { findByTestId } = render(App, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              user: {
                user: {
                  display_name: 'test user',
                  images: [{ url: '' }]
                }
              }
            }
          })
        ]
      }
    });

    // useUserStore().user will be set during getData which is called when authenticated
    // But it might need some wait for the async init/getData
    const userStore = useUserStore();
    userStore.getUser = vi.fn().mockResolvedValue(undefined);

    expect(await findByTestId('logo')).toBeTruthy();
    expect(await findByTestId('play-control-track')).toBeTruthy();
  });

  test('renders loading spinner when authenticated but user profile not yet fetched', async () => {
    (auth.useAuth as any).mockResolvedValue({
      isAuthenticated: true,
      accessToken: 'mock-token'
    });

    const { findByText } = render(App, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              user: {
                user: null // Not logged in yet
              }
            }
          })
        ]
      }
    });

    expect(await findByText('Loading...')).toBeTruthy();
  });
});
