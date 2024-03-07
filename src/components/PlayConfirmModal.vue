<template>
  <div
    v-if="selectedAlbum"
    class="fixed left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-end bg-gray-950 bg-opacity-80 text-white"
  >
    <div
      class="flex w-full flex-col items-center justify-center gap-2 rounded-t-3xl bg-gray-800 p-4"
    >
      <div className="pb-2">. . .</div>
      <div class="flex w-full items-center justify-start gap-4">
        <img
          :src="selectedAlbum.images[0].url"
          :alt="selectedAlbum.name"
          class="h-20 w-20 shadow-md"
        />
        <div class="flex flex-col gap-1 font-bold">
          <p>
            <span class="">{{ selectedAlbum.name }}</span>
          </p>
          <p>
            <span class="font-normal text-gray-300">{{ selectedAlbum.artists[0].name }}</span>
          </p>
        </div>
      </div>
      <div class="w-full border border-gray-700"></div>
      <div class="flex flex-col gap-2">
        <button class="rounded border border-green-600 bg-green-600 px-20 py-1" @click="play">
          Play
        </button>
        <button class="rounded border border-gray-950 bg-gray-950 px-20 py-1" @click="next">
          Next
        </button>
        <button class="rounded border px-20 py-1" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useUserSavedAlbumsStore } from '../data';
const userSavedAlbums = useUserSavedAlbumsStore();
const selectedAlbum = computed(() => userSavedAlbums.selectedAlbum);
function play() {
  const url = selectedAlbum.value?.external_urls.spotify || '';
  if (url) {
    location.href = url;
  }
}
function next() {
  userSavedAlbums.setSelectedAlbumRandomly();
}
function close() {
  userSavedAlbums.clearSelectedAlbum();
}
</script>
