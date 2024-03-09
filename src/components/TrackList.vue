<template>
  <ul v-if="selectedPlaylist" class="flex w-full flex-col gap-2">
    <li
      v-for="track in tracks"
      :key="track.id"
      class="flex w-full gap-2 px-2"
      @click="selectTrack(track)"
    >
      <img
        :src="track.album.images[0].url"
        :alt="`${track.name} / ${track.album.name}`"
        class="h-16 w-16"
        loading="lazy"
        width="64px"
        height="64px"
      />
      <div class="flex w-full max-w-full flex-col justify-center overflow-x-hidden text-white">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap text-sm">{{ track.name }}</p>
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap text-sm font-thin">
          {{ track.album.name }}
        </p>
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap text-sm font-thin">
          {{ track.artists[0].name }}
        </p>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';
import { Track } from '@/types';

// stores
const userSavedPlaylists = useUserSavedPlaylistsStore();
const tracksStore = useTracksStore();

// computed
const selectedPlaylist = computed(() => userSavedPlaylists.selectedPlaylist);
const tracks = computed(() => tracksStore.tracks);

// methods
function selectTrack(track: Track) {
  tracksStore.setSelectedTrack(track);
}

// life cycle
onMounted(() => {
  tracksStore.fetchTracks();
});
</script>
