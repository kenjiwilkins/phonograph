<template>
  <template v-if="selectAlbum">
    <PlayConfirmModal />
  </template>
</template>
<script setup lang="ts">
import { computed } from "vue";
import PlayConfirmModal from "./PlayConfirmModal.vue";
import { useUserSavedAlbumsStore } from "../data";
const userSavedAlbums = useUserSavedAlbumsStore();
const selectedAlbum = computed(() => userSavedAlbums.selectedAlbum);
</script>
