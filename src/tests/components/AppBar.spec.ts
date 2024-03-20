import { render } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, test, expect } from 'vitest';
import AppBar from '@/components/AppBar.vue';
import { useUserStore } from '@/data';

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
    const { getByTestId, getByAltText } = render(AppBar, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              user: {
                loggedInState: true,
                user: {
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
                }
              }
            }
          })
        ]
      }
    });
    expect(getByTestId('user-button').textContent).toContain('test');
    getByAltText('test');
  });
});
