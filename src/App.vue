<template>
  <div class="h-full w-full bg-gray-950 text-white">
    <app-bar />
    <main class="min-h-screen w-full overflow-x-hidden">
      <play-control-area />
      <album-list />
    </main>
    <play-confirm-modal />
    <app-footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppBar from './components/AppBar.vue';
import PlayControlArea from './components/PlayControlArea.vue';
import AlbumList from './components/AlbumList.vue';
import PlayConfirmModal from './components/PlayConfirmModal.vue';
import AppFooter from './components/AppFooter.vue';
import { useAuth } from './auth';
import { useUserStore, useUserSavedAlbumsStore } from './data';
// stores
const userStore = useUserStore();
const userSavedAlbums = useUserSavedAlbumsStore();

// methods
async function init() {
  try {
    await useAuth();
    await userStore.getUser();
    await userSavedAlbums.fetchUserSavedAlbums();
  } catch (error) {
    console.error(error);
  }
}

// life cycle
onMounted(async () => {
  try {
    await init();
  } catch (error) {
    console.error(error);
  }
});
</script>
