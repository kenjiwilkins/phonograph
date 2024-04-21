import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { faker } from '@faker-js/faker';
import { useUserStore } from '@/data';
import { User } from '@/types';
import * as api from '@/api';

const testUser: User = {
  id: faker.string.uuid(),
  country: faker.location.country(),
  display_name: faker.person.fullName(),
  email: faker.internet.email(),
  images: [
    {
      height: 640,
      url: faker.image.url(),
      width: 640
    }
  ],
  product: 'premium',
  type: 'user',
  uri: faker.internet.url(),
  explicit_content: {
    filter_enabled: false,
    filter_locked: false
  },
  external_urls: {
    spotify: faker.internet.url()
  },
  followers: {
    href: null,
    total: faker.number.int()
  },
  href: faker.internet.url()
};
let rejectError = false;
const getUserProfile = vi.fn().mockImplementation(() => {
  if (rejectError) {
    return Promise.reject('Test Error');
  }
  return Promise.resolve(testUser);
});

vi.spyOn(api, 'getUserProfile').mockImplementation(getUserProfile);

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  it('should run all actions', async () => {
    const store = useUserStore();
    expect(store.isLoggedIn).toBe(false);
    store.setToken('token');
    store.setAuthCode('authCode');
    store.setAccessToken('accessToken');
    await store.getUser();
    expect(store.isLoggedIn).toBe(true);
    expect(store.user).toEqual(testUser);
  });
  it('should handle error', async () => {
    rejectError = true;
    const store = useUserStore();
    try {
      await store.getUser();
    } catch (error) {
      expect(error).toBe('Test Error');
    }
    expect(store.isLoggedIn).toBe(false);
  });
});
