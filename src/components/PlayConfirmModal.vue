<template>
  <div
    v-if="selectedAlbum"
    class="text-white min-w-full min-h-full bg-gray-950 absolute top-0 left-0 z-20 flex flex-col items-center justify-center"
  >
    <div
      class="w-fit p-4 bg-gray-700 rounded flex flex-col items-center justify-center gap-2"
    >
      <div className="">
        <h2 className="font-bold">Do you feel like playing this album?</h2>
      </div>
      <div class="flex flex-col items-center justify-center gap-4">
        <img
          :src="selectedAlbum.images[0].url"
          :alt="selectedAlbum.name"
          class="h-40 w-40 shadow-md"
        />
        <p>
          <span class="font-bold">{{ selectedAlbum.name }}</span>
          <span class="font-thin"> by </span>
          <span class="font-bold">{{ selectedAlbum.artists[0].name }}</span>
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button
          class="border rounded py-1 px-20 bg-green-600 border-green-600"
          @click="play"
        >
          Play
        </button>
        <button
          class="border rounded py-1 px-20 bg-gray-950 border-gray-950"
          @click="next"
        >
          Next
        </button>
        <button class="border rounded py-1 px-20" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useUserSavedAlbumsStore } from "../data";
const userSavedAlbums = useUserSavedAlbumsStore();
const selectedAlbum = computed(() => userSavedAlbums.selectedAlbum);
function play() {
  const url = selectedAlbum.value?.external_urls.spotify || "";
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
