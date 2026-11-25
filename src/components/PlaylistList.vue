<template>
  <SpotifyAttribution />
  <ul v-if="hasSavedPlaylists" class="w-full" data-testid="playlist-list">
    <li v-for="(playlist, index) in savedPlaylists" :key="playlist.id">
      <MediaRow
        :title="playlist.name"
        :meta="playlistMeta(playlist)"
        :index="index"
        :image-src="getImageUrl(playlist.images, 64)"
        placeholder-icon="playlist"
        :disabled="!getPlaylistItems(playlist)"
        :title-test-id="`playlist-li-playlist-name-${index}`"
        :meta-test-id="`playlist-li-playlist-total-${index}`"
        :data-testid="`playlist-li-${index}`"
        @click="selectPlaylist(playlist)"
      />
    </li>
  </ul>
  <ContentPlaceholder v-else />
  <div v-if="hasSavedPlaylists" ref="sentinel" aria-hidden="true" data-testid="playlist-list-end" />
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ContentPlaceholder from './ContentPlaceholder.vue';
import SpotifyAttribution from './SpotifyAttribution.vue';
import MediaRow from './MediaRow.vue';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';
import { Playlist } from '@/types';
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
function playlistMeta(playlist: Playlist) {
  const items = getPlaylistItems(playlist);
  // Spotify only returns the contents of playlists the user owns or collaborates on
  return items ? `${items.total} tracks` : 'Shared · tracks not available';
}

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
