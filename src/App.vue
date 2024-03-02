<template>
  <div class="bg-gray-950 text-white w-full h-full overflow-x-hidden">
    <app-bar />
    <play-control-area />
    <album-list />
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
const userStore = useUserStore();
const userSavedAlbums = useUserSavedAlbumsStore();
async function init() {
  try {
    await useAuth();
    await userStore.getUser();
    await userSavedAlbums.fetchUserSavedAlbums();
  } catch (error) {
    // userStore.setAccessToken("");
    // await init();
  }
}
onMounted(async () => {
  try {
    await init();
  } catch (error) {
    // userStore.setAccessToken("");
    // await init();
  }
});
</script>
