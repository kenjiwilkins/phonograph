<template>
  <div class="h-full w-full bg-gray-950 text-white">
    <app-bar />
    <main class="min-h-screen w-full overflow-x-hidden" v-if="isLoggedIn">
      <play-control-area />
      <album-list v-if="isAlbumTab" />
      <playlist-list v-if="isPlaylistTab && !isShowTrackList" />
      <track-list v-if="isShowTrackList" />
    </main>
    <main v-else class="flex h-screen w-full flex-col items-center justify-center pb-16">
      <p class="sr-only">Loading...</p>
      <div
        class="box-border inline-block h-8 w-8 animate-spin rounded-full border border-solid border-white border-b-green-500"
      />
    </main>
    <play-confirm-modal />
    <app-footer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import AppBar from './components/AppBar.vue';
import PlayControlArea from './components/PlayControlArea.vue';
import AlbumList from './components/AlbumList.vue';
import PlaylistList from './components/PlaylistList.vue';
import TrackList from './components/TrackList.vue';
import PlayConfirmModal from './components/PlayConfirmModal.vue';
import AppFooter from './components/AppFooter.vue';
import { useAuth } from './auth';
import {
  useUserStore,
  useUserSavedAlbumsStore,
  useTabStore,
  useUserSavedPlaylistsStore,
  TabType
} from './data';
// stores
const userStore = useUserStore();
const userSavedAlbums = useUserSavedAlbumsStore();
const userSavedPlaylists = useUserSavedPlaylistsStore();
const tabStore = useTabStore();

// computed
const currentTab = computed(() => tabStore.currentTab);
const isAlbumTab = computed(() => currentTab.value === TabType.ALBUM);
const isPlaylistTab = computed(() => currentTab.value === TabType.PLAYLIST);
const isShowTrackList = computed(() => userSavedPlaylists.selectedPlaylist);
const isLoggedIn = computed(() => userStore.isLoggedIn);

// methods
async function init() {
  try {
    await useAuth();
    return;
  } catch (error) {
    console.error(error);
    return;
  }
}
async function getData() {
  try {
    await userStore.getUser();
    await userSavedAlbums.fetchUserSavedAlbums();
  } catch (error) {
    if (error) {
      console.error(error);
    }
  }
}

// life cycle
onMounted(async () => {
  try {
    await init();
    await getData();
  } catch (error) {
    console.error(error);
  }
});
</script>
