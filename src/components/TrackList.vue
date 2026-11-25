<template>
  <SpotifyAttribution />
  <ul v-if="selectedPlaylist" class="w-full" data-testid="track-list">
    <li v-for="(track, index) in tracks" :key="`${track.id}-${index}`">
      <MediaRow
        :title="track.name"
        :index="index"
        :image-src="getImageUrl(track.album.images, 64)"
        :current="track.id === selectedTrackId"
        :title-test-id="`track-li-name-${index}`"
        :data-testid="`track-li-${index}`"
        @click="selectTrack(track)"
      >
        <!-- One meta line, "Album · Artist", keeping a test id on each part -->
        <template #meta>
          <span :data-testid="`track-li-album-${index}`">{{ track.album.name }}</span>
          <template v-if="track.artists[0]?.name">
            ·
            <span :data-testid="`track-li-artist-${index}`">{{ track.artists[0].name }}</span>
          </template>
        </template>
      </MediaRow>
    </li>
  </ul>
  <ContentPlaceholder v-else />
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ContentPlaceholder from './ContentPlaceholder.vue';
import SpotifyAttribution from './SpotifyAttribution.vue';
import MediaRow from './MediaRow.vue';
import { useUserSavedPlaylistsStore, useTracksStore } from '@/data';
import { TrackSummary } from '@/types';
import { getImageUrl } from '@/utils';

// stores
const userSavedPlaylists = useUserSavedPlaylistsStore();
const tracksStore = useTracksStore();

// computed
const selectedPlaylist = computed(() => userSavedPlaylists.selectedPlaylist);
const tracks = computed(() => tracksStore.tracks);
const selectedTrackId = computed(() => tracksStore.selectedTrack?.id);

// methods
function selectTrack(track: TrackSummary) {
  tracksStore.setSelectedTrack(track);
}

// life cycle
onMounted(() => {
  tracksStore.fetchTracks();
});
</script>
