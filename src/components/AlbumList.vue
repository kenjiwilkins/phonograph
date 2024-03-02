<template>
  <ul v-if="savedAlbums.length" class="flex flex-col gap-2 py-2">
    <li
      v-for="album in savedAlbums"
      :key="album.id"
      class="flex gap-2 px-2"
      @click="selectAlbum(album)"
    >
      <img :src="album.images[0].url" :alt="album.name" class="h-16 w-16" />
      <div class="flex flex-col justify-center max-w-full">
        <p
          class="text-white text-ellipsis whitespace-nowrap w-full overflow-x-hidden"
        >
          {{ album.name }}
        </p>
        <p class="text-md font-thin text-white">
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
import { computed, onMounted, onBeforeMount } from "vue";
import { useUserSavedAlbumsStore } from "../data";
import { Album } from "../types";
// store
const userSavedAlbums = useUserSavedAlbumsStore();
// computed
const savedAlbums = computed(() => userSavedAlbums.albums);
const isLoading = computed(() => userSavedAlbums.isLoading);
// methods
function selectAlbum(album: Album) {
  userSavedAlbums.setSelectedAlbum(album);
}
function getMoreAlbums() {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight &&
    savedAlbums.value.length
  ) {
    userSavedAlbums.fetchNextUserSavedAlbums();
  }
}

// Add event listener to fetch more albums when the user scrolls to the bottom
onMounted(() => {
  window.addEventListener("scroll", getMoreAlbums);
});
// Remove event listener when the component is unmounted
onBeforeMount(() => {
  window.removeEventListener("scroll", getMoreAlbums);
});
</script>
