import { defineStore } from 'pinia';

export enum TabType {
  ALBUM = 'ALBUM',
  PLAYLIST = 'PLAYLIST'
}

export const useTabStore = defineStore('tab', {
  state: () => ({
    currentTab: TabType.ALBUM,
    tabs: [TabType.ALBUM, TabType.PLAYLIST]
  }),
  actions: {
    setCurrentTab(tab: TabType) {
      // make it Album tab if tab is not in tabs
      if (!this.tabs.includes(tab)) {
        this.currentTab = TabType.ALBUM;
        return;
      }
      this.currentTab = tab;
    }
  }
});
