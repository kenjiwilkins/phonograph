<template>
  <ul v-if="hasSavedPlaylists" class="flex w-full flex-col gap-2 py-2">
    <li
      v-for="(playlist, index) in savedPlaylists"
      :key="playlist.id"
      class="flex w-full gap-2 px-2"
      :class="{ 'opacity-50': !getPlaylistItems(playlist) }"
      @click="selectPlaylist(playlist)"
      role="button"
      :aria-disabled="!getPlaylistItems(playlist)"
      :data-testid="`playlist-li-${index}`"
    >
      <content-image
        :src="getImageUrl(playlist.images, 64) ?? playlistIcon"
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
          <template v-if="getPlaylistItems(playlist)">
            {{ getPlaylistItems(playlist)?.total }} tracks
          </template>
          <template v-else>Tracks not available</template>
        </p>
      </div>
    </li>
  </ul>
  <ContentPlaceholder v-else />
  <div v-if="hasSavedPlaylists" ref="sentinel" aria-hidden="true" data-testid="playlist-list-end" />
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ContentPlaceholder from './ContentPlaceholder.vue';
import ContentImage from './ContentImage.vue';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';
import { Playlist } from '@/types';
import playlistIcon from '@assets/playlists.svg';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import { getImageUrl, getPlaylistItems } from '@/utils';

// stores
const userSavedPlaylists = useUserSavedPlaylistsStore();
const tracksStore = useTracksStore();

// data
const sentinel = ref<HTMLElement | null>(null);

// computed
const savedPlaylists = computed(() => userSavedPlaylists.playlists);
const hasSavedPlaylists = computed(() => savedPlaylists.value.length > 0);

// methods
function selectPlaylist(playlist: Playlist) {
  // Spotify only returns the contents of playlists the user owns or collaborates on
  const items = getPlaylistItems(playlist);
  if (!items) return;
  tracksStore.openPlaylist({
    playlistId: playlist.id,
    snapshotId: playlist.snapshot_id,
    url: items.url,
    total: items.total
  });
  userSavedPlaylists.setSelectedPlaylist(playlist);
}

// Load the next page when the end of the list scrolls into view
useInfiniteScroll(
  sentinel,
  () => userSavedPlaylists.fetchNextUserSavedPlaylists(),
  () => userSavedPlaylists.hasNext
);

// life cycle
onMounted(() => {
  userSavedPlaylists.fetchUserSavedPlaylists();
});
</script>
