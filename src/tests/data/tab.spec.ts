import { beforeEach, describe, expect, it } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTabStore, TabType } from '@/data';

describe('TabStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  it('should run all actions', () => {
    const store = useTabStore();
    expect(store.currentTab).toBe('ALBUM');
    store.setCurrentTab(TabType.PLAYLIST);
    expect(store.currentTab).toBe('PLAYLIST');
  });
});
