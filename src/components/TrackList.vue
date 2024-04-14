<template>
  <ul v-if="selectedPlaylist" class="flex w-full flex-col gap-2" data-testid="track-list">
    <li
      v-for="(track, index) in tracks"
      :key="track.id"
      class="flex w-full gap-2 px-2"
      role="button"
      @click="selectTrack(track)"
      :data-testid="`track-li-${index}`"
    >
      <content-image :src="track.album.images[0].url" :alt="track.name" :height="64" :width="64" />
      <div class="flex w-full max-w-full flex-col justify-center overflow-x-hidden text-white">
        <p
          class="overflow-x-hidden text-ellipsis whitespace-nowrap text-sm"
          :data-testid="`track-li-name-${index}`"
        >
          {{ track.name }}
        </p>
        <p
          class="overflow-x-hidden text-ellipsis whitespace-nowrap text-sm font-thin"
          :data-testid="`track-li-album-${index}`"
        >
          {{ track.album.name }}
        </p>
        <p
          class="overflow-x-hidden text-ellipsis whitespace-nowrap text-sm font-thin"
          :data-testid="`track-li-artist-${index}`"
        >
          {{ track.artists[0].name }}
        </p>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ContentImage from './ContentImage.vue';
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
