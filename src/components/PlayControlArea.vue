<template>
  <template v-if="isAlbumSelected">
    <div
      v-if="albumsCount"
      class="flex flex-col justify-around p-2"
      data-testid="play-control-album"
    >
      <div class="flex justify-start">
        <p class="text-xs text-gray-500">
          <span>{{ albumsCount }}/{{ totalAlbums }} albums</span>
        </p>
      </div>
      <div class="flex justify-end">
        <button
          :class="fetching ? 'border-gray-700 text-gray-700' : 'border-white text-white'"
          class="flex gap-1 rounded border p-2"
          @click="playRandomAlbum"
          :disabled="fetching"
          data-testid="play-control-album-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            :class="fetching ? 'fill-gray-700' : 'fill-white'"
          >
            <path
              d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"
            />
          </svg>
          <span v-if="fetching">lodaing</span>
          <span v-else>Play Random</span>
        </button>
      </div>
    </div>
  </template>
  <template v-if="isPlaylistSelected && !tracksCount">
    <div
      v-if="playlistsCount"
      class="flex flex-col justify-around p-2"
      data-testid="play-control-playlist"
    >
      <div class="flex justify-start">
        <p class="text-xs text-gray-500">
          <span>{{ playlistsCount }}/{{ totalPlaylists }} playlists</span>
        </p>
      </div>
    </div>
  </template>
  <template v-if="tracksCount">
    <div
      v-if="tracksCount"
      class="flex flex-col justify-around p-2"
      data-testid="play-control-track"
    >
      <div class="flex justify-start">
        <p class="text-xs text-gray-500">
          <span>{{ tracksCount }}/{{ totalTracks }} tracks</span>
        </p>
      </div>
      <div class="flex justify-end">
        <button
          :class="fetching ? 'border-gray-700 text-gray-700' : 'border-white text-white'"
          class="flex gap-1 rounded border p-2"
          @click="playRandomTrackAlbum"
          :disabled="fetching"
          data-testid="play-control-track-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            :class="fetching ? 'fill-gray-700' : 'fill-white'"
          >
            <path
              d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"
            />
          </svg>
          <span v-if="fetching">lodaing</span>
          <span v-else>Play Random</span>
        </button>
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  useUserSavedAlbumsStore,
  useTabStore,
  TabType,
  useUserSavedPlaylistsStore,
  useTracksStore
} from '../data';

// store
const userSavedAlbums = useUserSavedAlbumsStore();
const userSavedPlaylists = useUserSavedPlaylistsStore();
const trackStore = useTracksStore();
const tabStore = useTabStore();

// data
const fetching = ref(false);

// computed
const albumsCount = computed(() => userSavedAlbums.albums.length);
const playlistsCount = computed(() => userSavedPlaylists.playlists.length);
const tracksCount = computed(() => trackStore.tracks.length);
const totalAlbums = computed(() => userSavedAlbums.totalAlbums);
const totalPlaylists = computed(() => userSavedPlaylists.totalPlaylists);
const totalTracks = computed(() => trackStore.totalTracks);
const isAlbumSelected = computed(() => tabStore.currentTab === TabType.ALBUM);
const isPlaylistSelected = computed(() => tabStore.currentTab === TabType.PLAYLIST);

async function playRandomAlbum() {
  if (fetching.value) return;
  if (albumsCount.value >= totalAlbums.value) {
    userSavedAlbums.setSelectedAlbumRandomly();
    return;
  }
  try {
    fetching.value = true;
    await userSavedAlbums.fetchAllUserSavedAlbums();
    fetching.value = false;
  } catch (error) {
    if (error) {
      console.log(error);
    }
    fetching.value = false;
    return;
  }
  return userSavedAlbums.setSelectedAlbumRandomly();
}
async function playRandomTrackAlbum() {
  if (fetching.value) return;
  if (tracksCount.value >= totalTracks.value) {
    trackStore.setSelectedTrackRandomly();
    return;
  }
  try {
    fetching.value = true;
    await trackStore.fetchAllTracks();
    fetching.value = false;
  } catch (error) {
    if (error) {
      console.log(error);
    }
    fetching.value = false;
    return;
  }
  return trackStore.setSelectedTrackRandomly();
}
</script>
