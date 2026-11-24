<template>
  <ul v-if="savedAlbums.length" class="flex w-full flex-col gap-2 py-2" data-testid="album-list">
    <li
      v-for="(album, index) in savedAlbums"
      :key="album.id"
      class="flex w-full gap-2 px-2"
      @click="selectAlbum(album)"
      :data-testid="'album-list-item-' + index"
      role="button"
    >
      <content-image
        :src="getImageUrl(album.images, 64)"
        :alt="album.name"
        :height="64"
        :width="64"
        :data-testid="`album-li-img-${index}`"
      />
      <div class="flex w-full max-w-full flex-col justify-center overflow-x-hidden text-white">
        <p
          class="overflow-x-hidden text-ellipsis whitespace-nowrap"
          :data-testid="`album-li-name-${index}`"
        >
          {{ album.name }}
        </p>
        <p
          class="text-md overflow-x-hidden text-ellipsis whitespace-nowrap font-thin"
          :data-testid="`album-li-artist-${index}`"
        >
          {{ album.artists[0]?.name }}
        </p>
      </div>
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
import ContentImage from './ContentImage.vue';
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
    userSavedAlbums.fetchUserSavedAlbums();
  }
});
</script>
