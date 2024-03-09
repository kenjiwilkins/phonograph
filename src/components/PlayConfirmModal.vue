<template>
  <Transition>
    <div
      v-if="selectedAlbum"
      class="overlay fixed left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-end bg-gray-950 bg-opacity-80 text-white"
      @click="close"
    >
      <div
        :class="`popup ${selectedAlbum ? 'popup-enter-active' : 'popup-leave-active'}`"
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
  </Transition>
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
<style scoped>
/* popup animation to popup from bottom */
.v-enter-active.overlay {
  animation: fade-in 0.3s;
}
.v-enter-active.overlay .popup {
  animation: slide-up 0.3s;
}
.v-leave-active.overlay {
  animation: fade-out 0.3s;
}
.v-leave-active.overlay .popup {
  animation: slide-back 0.3s;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes slide-back {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
</style>
