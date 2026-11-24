<template>
  <ul v-if="savedAlbums.length" class="w-full" data-testid="album-list">
    <li v-for="(album, index) in savedAlbums" :key="album.id">
      <MediaRow
        :title="album.name"
        :meta="album.artists[0]?.name"
        :index="index"
        :image-src="getImageUrl(album.images, 64)"
        :current="album.id === selectedAlbumId"
        :image-test-id="`album-li-img-${index}`"
        :title-test-id="`album-li-name-${index}`"
        :meta-test-id="`album-li-artist-${index}`"
        :data-testid="'album-list-item-' + index"
        @click="selectAlbum(album)"
      />
    </li>
  </ul>
  <ContentPlaceholder v-else />
  <div v-if="savedAlbums.length" ref="sentinel" aria-hidden="true" data-testid="album-list-end" />
  <div v-if="isLoading" class="flex justify-center py-2" data-testid="loading">
    <p class="text-gray-500">Loading...</p>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ContentPlaceholder from './ContentPlaceholder.vue';
import MediaRow from './MediaRow.vue';
import { useUserSavedAlbumsStore } from '../data';
import { AlbumSummary } from '../types';
import { getImageUrl } from '@/utils';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
// store
const userSavedAlbums = useUserSavedAlbumsStore();

// data
const sentinel = ref<HTMLElement | null>(null);

// computed
const savedAlbums = computed(() => userSavedAlbums.albums);
const isLoading = computed(() => userSavedAlbums.isLoading);
const selectedAlbumId = computed(() => userSavedAlbums.selectedAlbum?.id);
// methods
function selectAlbum(album: AlbumSummary) {
  userSavedAlbums.setSelectedAlbum(album);
}

// Load the next page when the end of the list scrolls into view
useInfiniteScroll(
  sentinel,
  () => userSavedAlbums.fetchNextUserSavedAlbums(),
  () => userSavedAlbums.hasNext
);

onMounted(() => {
  if (savedAlbums.value.length === 0) {
    userSavedAlbums.loadUserSavedAlbums();
  }
});
</script>
