<template>
  <Transition>
    <div
      v-if="showModal"
      class="overlay fixed top-0 left-0 z-20 flex h-full w-full flex-col items-center justify-end bg-gray-950/80 text-white"
      @click.self="close"
      data-testid="play-confirm-modal-overlay"
    >
      <div
        :class="`popup ${selectedAlbum ? 'popup-enter-active' : 'popup-leave-active'}`"
        class="flex w-full flex-col items-center justify-center gap-2 rounded-t-3xl bg-gray-800 p-4"
        data-testid="play-confirm-modal"
      >
        <div class="pb-2">. . .</div>
        <div class="flex w-full items-center justify-start gap-4">
          <content-image
            :src="imageUrl"
            :alt="albumName"
            :height="80"
            :width="80"
            class="shadow-md"
          />
          <div class="flex flex-col gap-1 font-bold">
            <p>
              <span class="" data-testid="play-confirm-modal-album-name">{{ albumName }}</span>
            </p>
            <p>
              <span
                class="font-normal text-gray-300"
                data-testid="play-confirm-modal-artist-name"
                >{{ artistName }}</span
              >
            </p>
          </div>
        </div>
        <div class="w-full border border-gray-700"></div>
        <div class="flex w-full flex-col items-start gap-0">
          <button
            class="flex w-full items-center gap-2 py-2"
            @click.prevent="play"
            data-testid="play-confirm-modal-play-button"
          >
            <img :src="playIcon" class="h-8 w-8" />
            <span>Play Album</span>
          </button>
          <button
            class="flex w-full items-center gap-2 py-2"
            @click.prevent="next"
            data-testid="play-confirm-modal-next-button"
          >
            <img :src="shuffleIcon" class="h-8 w-8" />
            <span>Shuffle to Next Album</span>
          </button>
          <button
            class="flex w-full items-center gap-2 py-2"
            @click.prevent="close"
            data-testid="play-confirm-modal-close-button"
          >
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
import { getImageUrl } from '@/utils';
import ContentImage from './ContentImage.vue';

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
    return getImageUrl(selectedAlbum.value.images, 80);
  } else if (selectedTrack.value) {
    return getImageUrl(selectedTrack.value.album.images, 80);
  } else {
    return undefined;
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
    return selectedAlbum.value.artists[0]?.name ?? '';
  } else if (selectedTrack.value) {
    return selectedTrack.value.artists[0]?.name ?? '';
  } else {
    return 'Ooops something went wrong';
  }
});

// methods
function play() {
  let url = '';
  if (selectedTrack.value) {
    url = selectedTrack.value.album.external_urls.spotify;
  } else if (selectedAlbum.value) {
    url = selectedAlbum.value.external_urls.spotify;
  }
  if (url) {
    location.href = url;
  }
}
async function next() {
  try {
    if (selectedAlbum.value) {
      await userSavedAlbums.pickRandomAlbum();
    } else if (selectedTrack.value) {
      await tracksStore.pickRandomTrack();
    }
  } catch (error) {
    console.error(error);
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
