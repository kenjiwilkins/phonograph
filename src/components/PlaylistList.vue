<template>
  <ul v-if="hasSavedPlaylists" class="flex w-full flex-col gap-2 py-2">
    <li
      v-for="(playlist, index) in savedPlaylists"
      :key="playlist.id"
      class="flex w-full gap-2 px-2"
      @click="selectPlaylist(playlist)"
      role="button"
      :data-testid="`playlist-li-${index}`"
    >
      <content-image
        :src="playlist.images ? playlist.images[0].url : playlistIcon"
        :alt="playlist.name"
        :height="64"
        :width="64"
      />
      <div class="flex w-full max-w-full flex-col justify-center overflow-x-hidden text-white">
        <p
          class="overflow-x-hidden text-ellipsis whitespace-nowrap"
          :data-testid="`playlist-li-playlist-name-${index}`"
        >
          {{ playlist.name }}
        </p>
        <p
          class="text-md overflow-x-hidden text-ellipsis whitespace-nowrap font-thin"
          :data-testid="`playlist-li-playlist-total-${index}`"
        >
          {{ playlist.tracks.total }} tracks
        </p>
      </div>
    </li>
  </ul>
  <div v-else></div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ContentImage from './ContentImage.vue';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';
import { Playlist } from '@/types';
import playlistIcon from '@assets/playlists.svg';

// stores
const userSavedPlaylists = useUserSavedPlaylistsStore();
const tracksStore = useTracksStore();

// computed
const savedPlaylists = computed(() => userSavedPlaylists.playlists);
const hasSavedPlaylists = computed(() => savedPlaylists.value.length > 0);

// methods
function selectPlaylist(playlist: Playlist) {
  tracksStore.setNextUrl(playlist.tracks.href);
  tracksStore.setTotalTracks(playlist.tracks.total);
  userSavedPlaylists.setSelectedPlaylist(playlist);
}

// life cycle
onMounted(() => {
  userSavedPlaylists.fetchUserSavedPlaylists();
});
</script>
