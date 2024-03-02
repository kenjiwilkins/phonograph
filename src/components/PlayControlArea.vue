<template>
  <div class="flex flex-col justify-around p-2">
    <div class="flex justify-start">
      <p class="text-xs text-gray-500">{{ albumsCount }} albums</p>
    </div>
    <div class="flex justify-end">
      <button class="flex gap-1 p-2 border rounded" @click="playRandomAlbum">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
          class="fill-white"
        >
          <path
            d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"
          />
        </svg>
        <span>Play Random</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useUserSavedAlbumsStore } from "../data";
const userSavedAlbums = useUserSavedAlbumsStore();

const albumsCount = computed(() => userSavedAlbums.albums.length);

function playRandomAlbum() {
  userSavedAlbums.setSelectedAlbumRandomly();
}
</script>
