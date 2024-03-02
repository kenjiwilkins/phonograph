<template>
  <div class="bg-gray-950 text-white w-full h-full">
    <app-bar ref="appBar" />
    <main ref="main" class="min-h-screen">
      <play-control-area />
      <album-list />
    </main>
    <play-confirm-modal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppBar from "./components/AppBar.vue";
import PlayControlArea from "./components/PlayControlArea.vue";
import AlbumList from "./components/AlbumList.vue";
import PlayConfirmModal from "./components/PlayConfirmModal.vue";
import { useAuth } from "./auth";
import { useUserStore, useUserSavedAlbumsStore } from "./data";
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
