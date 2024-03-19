import { beforeEach, describe, expect, it } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSavedAlbumsStore } from '@/data';
import { generateAlbum } from '../helpers';

describe('UserSavedAlbumsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  it('should run all actions', () => {
    const store = useUserSavedAlbumsStore();
    const albumCount = 5;
    const albums = Array.from({ length: albumCount }, () => generateAlbum());
    store.addAlbums(albums);
    expect(store.albums).toHaveLength(albumCount);
  });
});
