<template>
  <Transition @after-enter="focusSheet">
    <div
      v-if="showModal"
      class="overlay fixed inset-0 z-20 flex flex-col justify-end bg-scrim"
      @click.self="close"
      data-testid="play-confirm-modal-overlay"
    >
      <section
        ref="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-sheet-title"
        aria-describedby="play-sheet-artist"
        tabindex="-1"
        class="popup sheet"
        data-testid="play-confirm-modal"
        @keydown.esc.prevent="close"
        @keydown.tab="trapFocus"
      >
        <div class="sheet__body">
          <div class="mb-4 flex items-center justify-between gap-4">
            <span class="pg-hud text-volt">// Target acquired</span>
            <span
              v-if="position"
              class="pg-hud-sm text-ink-muted"
              data-testid="play-confirm-modal-position"
              >#{{ position.index }} / {{ position.total }}</span
            >
          </div>
          <div class="mb-4 flex items-center gap-4 border-b border-line pb-4">
            <span class="sheet__thumb">
              <ContentImage
                class="pg-cut pg-cut-sm"
                :src="imageUrl"
                :alt="albumName"
                :height="96"
                :width="96"
              />
            </span>
            <div class="min-w-0">
              <h2
                id="play-sheet-title"
                :key="albumKey"
                class="sheet__name"
                data-testid="play-confirm-modal-album-name"
              >
                {{ albumName }}
              </h2>
              <p
                id="play-sheet-artist"
                class="sheet__artist"
                data-testid="play-confirm-modal-artist-name"
              >
                {{ artistName }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <PgButton
              variant="primary"
              size="lg"
              block
              @click.prevent="play"
              data-testid="play-confirm-modal-play-button"
            >
              <template #icon>
                <svg viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" /></svg>
              </template>
              Play album
              <template #keyHint>Spotify ↗</template>
            </PgButton>
            <PgButton
              variant="ghost"
              block
              class="sheet__ghost"
              @click.prevent="next"
              data-testid="play-confirm-modal-next-button"
            >
              <template #icon>
                <svg viewBox="0 -960 960 960">
                  <path
                    d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"
                  />
                </svg>
              </template>
              Shuffle to next
            </PgButton>
            <PgButton
              variant="text"
              block
              @click.prevent="close"
              data-testid="play-confirm-modal-close-button"
            >
              <template #icon>
                <svg viewBox="0 -960 960 960">
                  <path
                    d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
                  />
                </svg>
              </template>
              Close
            </PgButton>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useUserSavedAlbumsStore, useTracksStore } from '@/data';
import { getImageUrl } from '@/utils';
import ContentImage from './ContentImage.vue';
import PgButton from './PgButton.vue';

// stores
const userSavedAlbums = useUserSavedAlbumsStore();
const tracksStore = useTracksStore();

// data
const sheet = ref<HTMLElement | null>(null);
let returnFocusTo: HTMLElement | null = null;

// computed
const selectedAlbum = computed(() => userSavedAlbums.selectedAlbum);
const selectedTrack = computed(() => tracksStore.selectedTrack);
const showModal = computed(() => {
  return selectedAlbum.value || selectedTrack.value;
});
const imageUrl = computed(() => {
  if (selectedAlbum.value) {
    return getImageUrl(selectedAlbum.value.images, 96);
  } else if (selectedTrack.value) {
    return getImageUrl(selectedTrack.value.album.images, 96);
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
/** Re-keys the name so its one-shot buzz runs again when Shuffle picks another album */
const albumKey = computed(() => selectedAlbum.value?.id ?? selectedTrack.value?.id ?? '');

/** HUD counters read as fixed-width numbers: 12 → 0012 */
const pad = (n: number) => String(n).padStart(4, '0');

/**
 * The item's place in its list: its position among the loaded items, or the offset it was
 * fetched from when Play random picked it beyond the loaded pages. Hidden when unknown.
 */
const position = computed(() => {
  const at = (index: number, offset: number | null, total: number) => {
    const i = index >= 0 ? index : offset;
    return i === null || !total ? null : { index: pad(i + 1), total: pad(total) };
  };
  if (selectedAlbum.value) {
    const id = selectedAlbum.value.id;
    return at(
      userSavedAlbums.albums.findIndex((album) => album.id === id),
      userSavedAlbums.lastRandomOffset,
      userSavedAlbums.totalAlbums
    );
  }
  if (selectedTrack.value) {
    const id = selectedTrack.value.id;
    return at(
      tracksStore.tracks.findIndex((track) => track.id === id),
      tracksStore.lastRandomOffset,
      tracksStore.totalTracks
    );
  }
  return null;
});

// Remember what had focus so closing the sheet can return there
watch(
  () => !!showModal.value,
  (open) => {
    if (open) {
      returnFocusTo = document.activeElement as HTMLElement | null;
      nextTick(focusSheet);
    } else {
      returnFocusTo?.focus?.();
      returnFocusTo = null;
    }
  },
  { immediate: true }
);

// methods
function focusSheet() {
  sheet.value?.focus();
}

/** Keep Tab inside the sheet while it is open */
function trapFocus(event: KeyboardEvent) {
  const focusable = sheet.value?.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (!focusable?.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === sheet.value)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

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
/* Panel with chamfer-lg top corners and a 2px volt edge that follows the cut */
.sheet {
  --cut: var(--chamfer-lg);
  --cut-shape: polygon(
    0 var(--cut),
    var(--cut) 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    0 100%
  );
  width: 100%;
  max-width: 32rem;
  margin: 0 auto;
  padding-top: 2px;
  background: var(--volt);
  clip-path: var(--cut-shape);
  outline: none;
}

.sheet__body {
  padding: 24px 16px 16px;
  background: var(--surface-200);
  clip-path: var(--cut-shape);
}

/* the ghost button sits on surface-200, not void */
.sheet__ghost {
  --btn-fill: var(--surface-200);
}

.sheet__thumb {
  position: relative;
  display: block;
  flex: none;
  width: 96px;
  height: 96px;
}

.sheet__thumb :deep(img),
.sheet__thumb :deep(div) {
  display: block;
  width: 96px;
  height: 96px;
  object-fit: cover;
}

.sheet__thumb::before,
.sheet__thumb::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 0 solid var(--line-strong);
  pointer-events: none;
}

.sheet__thumb::before {
  top: -3px;
  left: -3px;
  border-top-width: 2px;
  border-left-width: 2px;
}

.sheet__thumb::after {
  right: -3px;
  bottom: -3px;
  border-right-width: 2px;
  border-bottom-width: 2px;
}

.sheet__name {
  margin: 0;
  font-family: var(--font-content);
  font-size: 22px;
  font-weight: 800;
  line-height: 30px;
  color: var(--ink);
  overflow-wrap: anywhere;
  /* one buzz when the sheet opens or the album changes */
  animation: name-buzz 0.5s steps(5) 1;
}

.sheet__artist {
  margin: 4px 0 0;
  font-family: var(--font-content);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ink-muted);
}

@keyframes name-buzz {
  0%,
  100% {
    transform: translate(0);
    text-shadow: none;
  }
  20% {
    transform: translate(-2px, 1px);
    text-shadow:
      -2px 0 var(--buzz-red),
      2px 0 var(--buzz-mint);
  }
  40% {
    transform: translate(2px, -1px);
    text-shadow:
      2px 0 var(--buzz-red),
      -2px 0 var(--buzz-mint);
  }
  60% {
    transform: translate(-1px, 0);
    text-shadow:
      -1px 0 var(--buzz-red),
      1px 0 var(--buzz-mint);
  }
}

/* the sheet slides up from the bottom over a fading scrim (300ms) */
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

@media (prefers-reduced-motion: reduce) {
  .sheet__name,
  .v-enter-active.overlay,
  .v-enter-active.overlay .popup,
  .v-leave-active.overlay,
  .v-leave-active.overlay .popup {
    animation: none;
  }
}
</style>
