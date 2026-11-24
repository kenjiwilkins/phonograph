<template>
  <div
    v-if="playlist"
    class="flex items-center justify-between gap-3 px-4 pt-2"
    data-testid="playlist-header"
  >
    <button
      type="button"
      class="playlist-header__back"
      :aria-label="`Back to playlists: ${playlist.name}`"
      data-testid="playlist-back-button"
      @click="backToPlaylists"
    >
      <svg viewBox="0 -960 960 960" aria-hidden="true">
        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
      </svg>
      <span class="truncate">{{ playlist.name }}</span>
    </button>
    <span class="pg-tag pg-tag--mint flex-none">Open</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';

const userSavedPlaylists = useUserSavedPlaylistsStore();
const tracksStore = useTracksStore();

const playlist = computed(() => userSavedPlaylists.selectedPlaylist);

function backToPlaylists() {
  userSavedPlaylists.clearSelectedPlaylist();
  tracksStore.clearAllStates();
}
</script>

<style scoped>
.playlist-header__back {
  display: inline-flex;
  min-width: 0;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  border: 0;
  background: none;
  font-family: var(--font-content);
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  color: var(--ink);
}

.playlist-header__back svg {
  width: 20px;
  height: 20px;
  flex: none;
  fill: var(--cyan);
}

.playlist-header__back:hover {
  color: var(--cyan);
}
</style>
