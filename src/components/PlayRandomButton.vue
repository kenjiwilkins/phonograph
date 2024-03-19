<template>
  <button class="rounded-xl bg-green-500 p-4 text-lg font-bold text-white" @click="playRandomAlbum">
    Play Random Album
  </button>
</template>
<script setup lang="ts">
import { useUserSavedAlbumsStore } from '../data';
async function playRandomAlbum() {
  const userSavedAlbums = useUserSavedAlbumsStore();
  await userSavedAlbums.fetchAllUserSavedAlbums();
  userSavedAlbums.setSelectedAlbumRandomly();
}
</script>
