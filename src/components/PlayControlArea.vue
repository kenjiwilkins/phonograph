<template>
  <div class="px-4 pt-4 pb-2">
    <div class="pg-frame" :data-testid="readout.testId">
      <div class="p-4">
        <span class="pg-hud mb-1 block truncate" data-testid="play-control-label">{{
          readout.label
        }}</span>
        <div class="flex items-end justify-between gap-4">
          <div class="min-w-0 flex-1">
            <p class="m-0 whitespace-nowrap" data-testid="play-control-count">
              <span class="readout__value">{{ readout.loaded }}</span>
              <span class="readout__total"> / {{ readout.total }}</span>
              <span v-if="readout.summary" class="sr-only">{{ readout.summary }}</span>
            </p>
            <div class="readout__meter" aria-hidden="true">
              <i :style="{ width: `${readout.percent}%` }" data-testid="play-control-meter"></i>
            </div>
          </div>
          <PgButton
            v-if="readout.button"
            variant="primary"
            :loading="readout.mode === 'loading' || fetching"
            :data-testid="readout.button"
            @click="playRandom"
          >
            <template #icon>
              <svg viewBox="0 -960 960 960">
                <path
                  d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"
                />
              </svg>
            </template>
            Play random
          </PgButton>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  useUserSavedAlbumsStore,
  useTabStore,
  TabType,
  useUserSavedPlaylistsStore,
  useTracksStore
} from '../data';
import PgButton from './PgButton.vue';

// store
const userSavedAlbums = useUserSavedAlbumsStore();
const userSavedPlaylists = useUserSavedPlaylistsStore();
const trackStore = useTracksStore();
const tabStore = useTabStore();

// data
const fetching = ref(false);

// computed
const albumsCount = computed(() => userSavedAlbums.albums.length);
const playlistsCount = computed(() => userSavedPlaylists.playlists.length);
const tracksCount = computed(() => trackStore.tracks.length);
const isAlbumSelected = computed(() => tabStore.currentTab === TabType.ALBUM);
const isPlaylistSelected = computed(() => tabStore.currentTab === TabType.PLAYLIST);

type Mode = 'album' | 'playlist' | 'track' | 'loading';

const mode = computed<Mode>(() => {
  if (isAlbumSelected.value && albumsCount.value) return 'album';
  if (isPlaylistSelected.value && !tracksCount.value) {
    return playlistsCount.value ? 'playlist' : 'loading';
  }
  if (tracksCount.value) return 'track';
  return 'loading';
});

/** HUD counters read as fixed-width numbers: 12 → 0012 */
const pad = (n: number) => String(n).padStart(4, '0');

const readout = computed(() => {
  const label = isPlaylistSelected.value ? '// 02 Library.playlists' : '// 01 Library.albums';
  switch (mode.value) {
    case 'album':
      return counter('album', label, albumsCount.value, userSavedAlbums.totalAlbums, 'albums');
    case 'playlist':
      return counter(
        'playlist',
        label,
        playlistsCount.value,
        userSavedPlaylists.totalPlaylists,
        'playlists'
      );
    case 'track':
      return counter(
        'track',
        '// 03 Playlist.tracks',
        tracksCount.value,
        trackStore.totalTracks,
        'tracks'
      );
    default:
      return {
        mode: 'loading' as const,
        testId: 'play-control-track',
        label,
        loaded: '----',
        total: '----',
        summary: '',
        percent: 0,
        // The playlist list has no random play, so no button while it loads either
        button: isPlaylistSelected.value ? null : 'play-control-track-button'
      };
  }
});

function counter(
  kind: Exclude<Mode, 'loading'>,
  label: string,
  loaded: number,
  total: number,
  noun: string
) {
  return {
    mode: kind,
    testId: `play-control-${kind}`,
    label,
    loaded: pad(loaded),
    total: pad(total),
    summary: `${loaded} of ${total} ${noun} loaded`,
    percent: total ? Math.min(100, (loaded / total) * 100) : 0,
    button: kind === 'playlist' ? null : `play-control-${kind}-button`
  };
}

function playRandom() {
  if (mode.value === 'album') return run(() => userSavedAlbums.pickRandomAlbum());
  if (mode.value === 'track') return run(() => trackStore.pickRandomTrack());
}

async function run(pick: () => Promise<void>) {
  if (fetching.value) return;
  try {
    fetching.value = true;
    await pick();
  } catch (error) {
    console.error(error);
  } finally {
    fetching.value = false;
  }
}
</script>

<style scoped>
/* On phones the counter and the full button don't fit side by side; drop the icon, not the count */
@media (max-width: 399px) {
  :deep(.pg-btn__icon) {
    display: none;
  }
}

.readout__value {
  font-family: var(--font-mono);
  font-size: 32px;
  line-height: 32px;
  color: var(--volt);
  text-shadow: var(--glow-volt);
}

.readout__total {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.08em;
  color: var(--ink-dim);
}

/* segmented meter: 6px segments with 2px gaps */
.readout__meter {
  position: relative;
  height: 4px;
  margin-top: 8px;
  background: repeating-linear-gradient(90deg, var(--line) 0 6px, transparent 6px 8px);
}

.readout__meter > i {
  position: absolute;
  inset: 0 auto 0 0;
  background: repeating-linear-gradient(90deg, var(--volt) 0 6px, transparent 6px 8px);
}
</style>
