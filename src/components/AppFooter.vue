<template>
  <div class="h-16"></div>
  <footer class="fixed inset-x-0 bottom-0 z-10 h-16 border-t border-line bg-surface-100">
    <nav class="mx-auto grid h-full max-w-lg grid-cols-3" aria-label="Library">
      <a
        href="https://github.com/kenjiwilkins/phonograph"
        target="_blank"
        rel="noopener noreferrer"
        class="tab-bar__tab"
        data-testid="github-button"
      >
        <!-- A plain star instead of the GitHub mark: no brand logos inside the UI -->
        <svg viewBox="0 0 24 24" aria-hidden="true" data-testid="github-star-icon">
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6z" />
        </svg>
        <span>Star me<span class="sr-only"> on GitHub</span></span>
      </a>
      <button
        type="button"
        class="tab-bar__tab"
        :aria-current="isAlbumSelected ? 'page' : undefined"
        @click="setTab(TabType.ALBUM)"
        data-testid="album-button"
      >
        <svg viewBox="0 -960 960 960" aria-hidden="true" data-testid="album-icon">
          <path
            d="M480-300q75 0 127.5-52.5T660-480q0-75-52.5-127.5T480-660q-75 0-127.5 52.5T300-480q0 75 52.5 127.5T480-300Zm0-140q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520q17 0 28.5 11.5T520-480q0 17-11.5 28.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
          />
        </svg>
        <span data-testid="album-span">Albums</span>
      </button>
      <button
        type="button"
        class="tab-bar__tab"
        :aria-current="isPlaylistSelected ? 'page' : undefined"
        @click="setTab(TabType.PLAYLIST)"
        data-testid="playlist-button"
      >
        <svg viewBox="0 -960 960 960" aria-hidden="true" data-testid="playlist-icon">
          <path
            d="M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-28-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"
          />
        </svg>
        <span data-testid="playlist-span">Playlists</span>
      </button>
    </nav>
  </footer>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import {
  useUserSavedAlbumsStore,
  useUserSavedPlaylistsStore,
  useTracksStore,
  useTabStore,
  TabType
} from '@/data';

// store
const userSavedAlbums = useUserSavedAlbumsStore();
const userSavedPlaylists = useUserSavedPlaylistsStore();
const tracksStore = useTracksStore();
const tabStore = useTabStore();

// computed
const isAlbumSelected = computed(() => tabStore.currentTab === TabType.ALBUM);
const isPlaylistSelected = computed(() => tabStore.currentTab === TabType.PLAYLIST);

// methods
function setTab(tab: TabType) {
  if (tab === tabStore.currentTab) return;
  tabStore.setCurrentTab(tab);
  if (tab === TabType.ALBUM) {
    userSavedPlaylists.clearAllStates();
  } else {
    userSavedAlbums.clearAllStates();
  }
  tracksStore.clearAllStates();
}
</script>

<style scoped>
.tab-bar__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0;
  background: none;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--ink-muted);
}

.tab-bar__tab svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.tab-bar__tab:hover {
  color: var(--ink);
}

/* keep the focus ring inside the fixed bar */
.tab-bar__tab:focus-visible {
  outline-offset: -2px;
}

/* current tab: mint with a glowing 2px bar on the top edge and a small cut tick */
.tab-bar__tab[aria-current='page'] {
  color: var(--buzz-mint);
}

.tab-bar__tab[aria-current='page']::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 28%;
  right: 28%;
  height: 2px;
  background: var(--buzz-mint);
  box-shadow: var(--glow-mint);
}

.tab-bar__tab[aria-current='page']::after {
  content: '';
  position: absolute;
  top: 1px;
  left: calc(72% - 6px);
  width: 6px;
  height: 6px;
  background: var(--buzz-mint);
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}
</style>
