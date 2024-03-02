<template>
  <button
    class="text-white bg-green-500 p-4 rounded-xl text-lg font-bold"
    @click="playRandomAlbum"
  >
    Play Random Album
  </button>
</template>
<script setup lang="ts">
import { useUserSavedAlbumsStore } from "../data";
async function playRandomAlbum() {
  const userSavedAlbums = useUserSavedAlbumsStore();
  await userSavedAlbums.fetchAllUserSavedAlbums();
  userSavedAlbums.setSelectedAlbumRandomly();
}
</script>
