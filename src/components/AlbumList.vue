<template>
  <ul v-if="savedAlbums.length" class="flex w-full flex-col gap-2 py-2">
    <li
      v-for="album in savedAlbums"
      :key="album.id"
      class="flex w-full gap-2 px-2"
      @click="selectAlbum(album)"
    >
      <img :src="album.images[0].url" :alt="album.name" :height="64" :width="64" loading="lazy" />
      <div class="flex w-full max-w-full flex-col justify-center overflow-x-hidden text-white">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
          {{ album.name }}
        </p>
        <p class="text-md overflow-x-hidden text-ellipsis whitespace-nowrap font-thin">
          {{ album.artists[0].name }}
        </p>
      </div>
    </li>
  </ul>
  <div v-if="isLoading" class="flex justify-center py-2">
    <p class="text-gray-500">Loading...</p>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onBeforeMount, ref } from 'vue';
import ContentImage from './ContentImage.vue';
import { useUserSavedAlbumsStore } from '../data';
import { Album } from '../types';
// store
const userSavedAlbums = useUserSavedAlbumsStore();

// data
const footerHeight = 64;
const fetching = ref(false);

// computed
const savedAlbums = computed(() => userSavedAlbums.albums);
const isLoading = computed(() => userSavedAlbums.isLoading);
// methods
function selectAlbum(album: Album) {
  userSavedAlbums.setSelectedAlbum(album);
}
async function getMoreAlbums() {
  if (isLoading.value) return;
  if (fetching.value) return;
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - footerHeight &&
    savedAlbums.value.length
  ) {
    fetching.value = true;
    await userSavedAlbums.fetchNextUserSavedAlbums();
    fetching.value = false;
  }
}

// Add event listener to fetch more albums when the user scrolls to the bottom
onMounted(() => {
  if (savedAlbums.value.length === 0) {
    userSavedAlbums.fetchUserSavedAlbums();
  }
  window.addEventListener('scroll', getMoreAlbums);
  window.addEventListener('touchmove', getMoreAlbums);
});
// Remove event listener when the component is unmounted
onBeforeMount(() => {
  window.removeEventListener('scroll', getMoreAlbums);
  window.removeEventListener('touchmove', getMoreAlbums);
});
</script>
