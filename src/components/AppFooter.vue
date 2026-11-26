<template>
  <!-- Keeps the last row clear of the dock -->
  <div class="dock-spacer" aria-hidden="true"></div>
  <footer class="dock">
    <nav class="dock__bar" aria-label="Library">
      <!-- 1px edge that follows the cut corner; drawn apart so the bar can keep its backdrop blur -->
      <span class="dock__edge" aria-hidden="true"></span>
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
/* floating dock: detached from the sides and the bottom; only the bar takes taps */
.dock-spacer {
  height: calc(64px + 24px + env(safe-area-inset-bottom));
}

.dock {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 10;
  padding: 0 12px max(12px, env(safe-area-inset-bottom));
  pointer-events: none;
}

/* clip-path and backdrop-filter sit on the same element; no filter: drop-shadow() on an ancestor */
.dock__bar {
  --cut: var(--chamfer-md);
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  height: 64px;
  max-width: 280px;
  margin-inline: auto;
  pointer-events: auto;
  background: var(--dock-glass);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  backdrop-filter: blur(16px) saturate(140%);
  clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%);
}

@media (prefers-reduced-transparency: reduce) {
  .dock__bar {
    background: var(--surface-100);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

.dock__edge {
  position: absolute;
  inset: 0;
  padding: 1px;
  pointer-events: none;
  background: var(--line-strong);
  /* keep only a 1px ring: the border box minus the content box */
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box exclude,
    linear-gradient(#000 0 0);
}

/* the diagonal of the top-right cut, plus a small volt tick on it */
.dock__bar::before,
.dock__bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: var(--cut);
  height: var(--cut);
  pointer-events: none;
}

.dock__bar::before {
  background: linear-gradient(
    to bottom left,
    transparent calc(50% - 0.7px),
    var(--line-strong) calc(50% - 0.7px) calc(50% + 0.7px),
    transparent calc(50% + 0.7px)
  );
}

.dock__bar::after {
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  background: var(--volt);
  clip-path: polygon(100% 0, 100% 100%, 0 0);
}

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

/* keep the focus ring inside the dock */
.tab-bar__tab:focus-visible {
  outline-offset: -4px;
}

/* current tab: mint with a glowing 2px bar inside the top edge */
.tab-bar__tab[aria-current='page'] {
  color: var(--buzz-mint);
}

.tab-bar__tab[aria-current='page']::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 28%;
  right: 28%;
  height: 2px;
  background: var(--buzz-mint);
  box-shadow: var(--glow-mint);
}
</style>
