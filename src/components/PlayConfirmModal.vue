<template>
  <Transition>
    <div
      v-if="showModal"
      class="overlay fixed left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-end bg-gray-950 bg-opacity-80 text-white"
      @click.self="close"
    >
      <div
        :class="`popup ${selectedAlbum ? 'popup-enter-active' : 'popup-leave-active'}`"
        class="flex w-full flex-col items-center justify-center gap-2 rounded-t-3xl bg-gray-800 p-4"
      >
        <div className="pb-2">. . .</div>
        <div class="flex w-full items-center justify-start gap-4">
          <img :src="imageUrl" :alt="albumName" class="h-20 w-20 shadow-md" />
          <div class="flex flex-col gap-1 font-bold">
            <p>
              <span class="">{{ albumName }}</span>
            </p>
            <p>
              <span class="font-normal text-gray-300">{{ artistName }}</span>
            </p>
          </div>
        </div>
        <div class="w-full border border-gray-700"></div>
        <div class="flex w-full flex-col items-start gap-0">
          <button class="flex w-full items-center gap-2 py-2" @click.prevent="play">
            <img :src="playIcon" class="h-8 w-8" />
            <span>Play Album</span>
          </button>
          <button class="flex w-full items-center gap-2 py-2" @click.prevent="next">
            <img :src="shuffleIcon" class="h-8 w-8" />
            <span>Shuffle to Next Album</span>
          </button>
          <button class="flex w-full items-center gap-2 py-2" @click.prevent="close">
            <img :src="closeIcon" class="h-8 w-8" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useUserSavedAlbumsStore, useTracksStore } from '@/data';
import playIcon from '@assets/play.svg';
import shuffleIcon from '@assets/shuffle.svg';
import closeIcon from '@assets/close.svg';

// stores
const userSavedAlbums = useUserSavedAlbumsStore();
const tracksStore = useTracksStore();

// computed
const selectedAlbum = computed(() => userSavedAlbums.selectedAlbum);
const selectedTrack = computed(() => tracksStore.selectedTrack);
const showModal = computed(() => {
  return selectedAlbum.value || selectedTrack.value;
});
const imageUrl = computed(() => {
  if (selectedAlbum.value) {
    return selectedAlbum.value.images[0].url;
  } else if (selectedTrack.value) {
    return selectedTrack.value.album.images[0].url;
  } else {
    return 'Ooops something went wrong';
  }
});
const albumName = computed(() => {
  if (selectedAlbum.value) {
    return selectedAlbum.value.name;
  } else if (selectedTrack.value) {
    return selectedTrack.value.album.name;
  } else {
    return 'Ooops something went wrong';
  }
});
const artistName = computed(() => {
  if (selectedAlbum.value) {
    return selectedAlbum.value.artists[0].name;
  } else if (selectedTrack.value) {
    return selectedTrack.value.artists[0].name;
  } else {
    return 'Ooops something went wrong';
  }
});

// methods
function play() {
  let url = '';
  if (selectedTrack.value) {
    url = selectedTrack.value.external_urls.spotify;
  } else if (selectedAlbum.value) {
    url = selectedAlbum.value.external_urls.spotify;
  }
  if (url) {
    location.href = url;
  }
}
function next() {
  if (selectedAlbum.value) {
    userSavedAlbums.setSelectedAlbumRandomly();
  } else if (selectedTrack.value) {
    tracksStore.setSelectedTrackRandomly();
  }
}
function close() {
  userSavedAlbums.clearSelectedAlbum();
  tracksStore.clearSelectedTrack();
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
