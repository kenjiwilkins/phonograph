<template>
  <div class="h-16"></div>
  <footer class="fixed bottom-0 z-10 flex h-16 w-full bg-black bg-opacity-90 text-white">
    <div class="mx-auto grid h-full max-w-lg grid-cols-3 font-medium">
      <GitHubButton
        text="Star Me!"
        custom-class="group inline-flex flex-col items-center justify-center px-5"
      />
      <button
        type="button"
        class="group inline-flex flex-col items-center justify-center px-5"
        @click="setTab(TabType.ALBUM)"
        data-testid="album-button"
      >
        <svg
          class="h-5 w-5"
          :class="`${isAlbumSelected ? 'fill-green-500' : 'fill-white'}`"
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
          data-testid="album-icon"
        >
          <title id="album">Albums</title>
          <path
            d="M480-300q75 0 127.5-52.5T660-480q0-75-52.5-127.5T480-660q-75 0-127.5 52.5T300-480q0 75 52.5 127.5T480-300Zm0-140q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520q17 0 28.5 11.5T520-480q0 17-11.5 28.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
          />
        </svg>
        <span
          :class="`${isAlbumSelected ? 'text-green-500' : 'text-white'}`"
          data-testid="album-span"
          >Albums</span
        >
      </button>
      <button
        type="button"
        class="group inline-flex flex-col items-center justify-center px-5"
        @click="setTab(TabType.PLAYLIST)"
        data-testid="playlist-button"
      >
        <svg
          :class="isPlaylistSelected ? 'fill-green-500' : 'fill-white'"
          class="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
          data-testid="playlist-icon"
        >
          <title id="playlist">Playlists</title>
          <path
            d="M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-28-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"
          />
        </svg>
        <span
          :class="isPlaylistSelected ? 'text-green-500' : 'text-white'"
          data-testid="playlist-span"
          >Playlists</span
        >
      </button>
    </div>
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
import GitHubButton from './GitHubButton.vue';

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
