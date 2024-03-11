<template>
  <ul v-if="savedPlaylists.length" class="flex w-full flex-col gap-2 py-2">
    <li
      v-for="playlist in savedPlaylists"
      :key="playlist.id"
      class="flex w-full gap-2 px-2"
      @click="selectPlaylist(playlist)"
    >
      <content-image
        :src="playlist.images.length ? playlist.images[0].url : playlistIcon"
        :alt="playlist.name"
        :height="64"
        :width="64"
      />
      <div class="flex w-full max-w-full flex-col justify-center overflow-x-hidden text-white">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">{{ playlist.name }}</p>
        <p class="text-md overflow-x-hidden text-ellipsis whitespace-nowrap font-thin">
          {{ playlist.tracks.total }} tracks
        </p>
      </div>
    </li>
  </ul>
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
