<template>
  <div class="h-full w-full bg-gray-950 text-white">
    <app-bar />
    <main class="min-h-screen w-full overflow-x-hidden">
      <play-control-area />
      <album-list v-if="isAlbumTab" />
      <playlist-list v-if="isPlaylistTab && !isShowTrackList" />
      <track-list v-if="isShowTrackList" />
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
import { useAuth, getAccessTokenFromLocalStorage } from './auth';
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

// methods
async function init() {
  try {
    await useAuth();
  } catch (error) {
    console.error(error);
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
    init().then(() => {
      getData();
    });
  } catch (error) {
    console.error(error);
  }
});
</script>
