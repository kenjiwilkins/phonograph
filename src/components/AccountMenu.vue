<template>
  <button
    ref="trigger"
    type="button"
    class="account-chip"
    aria-haspopup="dialog"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-label="user ? `Account menu: ${user.display_name}` : 'Account menu'"
    data-testid="user-button"
    @click="isOpen ? close() : open()"
  >
    <template v-if="loading">
      <span class="pg-skel account-avatar" data-testid="account-trigger-skeleton"></span>
      <span class="pg-skel account-chip__skeleton"></span>
    </template>
    <template v-else>
      <!-- The name is in the label and shown next to it, so the avatar is decorative -->
      <img v-if="triggerImage" :src="triggerImage" alt="" class="account-avatar" />
      <span v-else class="account-avatar account-avatar--empty" aria-hidden="true">
        <svg viewBox="0 -960 960 960"><path :d="personIcon" /></svg>
      </span>
      <span class="account-chip__name">{{ user?.display_name }}</span>
    </template>
    <svg class="account-chip__caret" viewBox="0 -960 960 960" aria-hidden="true">
      <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
  </button>

  <!-- On <body>: inside the sticky app bar it would stack below the tab bar -->
  <Teleport to="body">
    <Transition name="account">
      <!-- Below 1024px a scrim with a bottom sheet; above, a popover under the trigger and an
           invisible backdrop. A click on either backdrop closes. -->
      <div
        v-if="isOpen"
        class="account-overlay"
        data-testid="account-overlay"
        @click.self="close"
        @keydown.esc.prevent="close"
      >
        <section
          ref="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-title"
          tabindex="-1"
          class="account-dialog"
          data-testid="account-menu"
          @keydown.tab="trapTab($event, dialog)"
        >
          <div class="account-dialog__body">
            <span class="account-dialog__grab" aria-hidden="true"></span>
            <div class="flex items-center justify-between">
              <h2 id="account-title" class="pg-hud account-dialog__title">// Account</h2>
              <button type="button" class="account-dialog__close" aria-label="Close" @click="close">
                <svg viewBox="0 -960 960 960" aria-hidden="true">
                  <path
                    d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
                  />
                </svg>
              </button>
            </div>

            <div v-if="loading" class="account-profile" data-testid="account-profile-skeleton">
              <p class="sr-only" role="status">Loading profile...</p>
              <span class="pg-skel account-avatar account-avatar--lg"></span>
              <span class="flex flex-1 flex-col gap-2" aria-hidden="true">
                <span class="pg-skel block h-4.5 w-3/5"></span>
                <span class="pg-skel block h-3 w-2/5"></span>
              </span>
            </div>
            <div v-else-if="user" class="account-profile">
              <img
                v-if="profileImage"
                :src="profileImage"
                alt=""
                class="account-avatar account-avatar--lg"
              />
              <span
                v-else
                class="account-avatar account-avatar--lg account-avatar--empty"
                aria-hidden="true"
              >
                <svg viewBox="0 -960 960 960"><path :d="personIcon" /></svg>
              </span>
              <div class="min-w-0">
                <p class="account-profile__name" data-testid="account-name">
                  {{ user.display_name }}
                </p>
                <p class="account-profile__id" data-testid="account-id">ID · {{ user.id }}</p>
                <a
                  v-if="user.external_urls?.spotify"
                  class="account-profile__link"
                  :href="user.external_urls.spotify"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="account-spotify-link"
                >
                  Open profile in Spotify
                  <svg viewBox="0 -960 960 960" aria-hidden="true">
                    <path :d="externalIcon" />
                  </svg>
                  <span class="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>

            <dl class="account-stats">
              <div v-for="stat in stats" :key="stat.label" class="pg-frame account-stat">
                <dt class="pg-hud-sm account-stat__label">{{ stat.label }}</dt>
                <dd
                  :class="['account-stat__value', { 'account-stat__value--pending': !stat.total }]"
                  :data-testid="stat.testId"
                >
                  {{ stat.total ? String(stat.total).padStart(4, '0') : '----' }}
                </dd>
              </div>
            </dl>

            <div>
              <h3 id="account-about" class="pg-section pg-hud account-section"><b>//</b> About</h3>
              <ul class="account-list" aria-labelledby="account-about">
                <li v-for="link in aboutLinks" :key="link.label">
                  <a
                    class="account-item"
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    :data-testid="link.testId"
                  >
                    <svg class="account-item__icon" viewBox="0 -960 960 960" aria-hidden="true">
                      <path :d="link.icon" />
                    </svg>
                    <span class="account-item__label">{{ link.label }}</span>
                    <span class="account-item__trail">
                      <span v-if="link.detail">{{ link.detail }}</span>
                      <svg viewBox="0 -960 960 960" aria-hidden="true">
                        <path :d="externalIcon" />
                      </svg>
                    </span>
                    <span class="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="pg-section pg-hud account-section"><b>//</b> Session</h3>
              <div
                v-if="isConfirming"
                role="alertdialog"
                aria-labelledby="logout-title"
                aria-describedby="logout-description"
                class="pg-frame account-confirm"
                data-testid="account-logout-confirm"
                @keydown.esc.prevent.stop="cancelLogout"
              >
                <span id="logout-title" class="pg-hud account-confirm__title">
                  // Log out of this device?
                </span>
                <p id="logout-description" class="account-confirm__text">
                  Removes your saved login and library cache from <b>this browser</b>. Your Spotify
                  account and Phonograph's access to it stay as they are.
                </p>
                <div class="account-confirm__actions">
                  <PgButton
                    ref="cancelButton"
                    variant="ghost"
                    data-testid="account-logout-cancel"
                    @click="cancelLogout"
                  >
                    Cancel
                  </PgButton>
                  <PgButton variant="danger" data-testid="account-logout-ok" @click="confirmLogout">
                    <template #icon>
                      <svg viewBox="0 -960 960 960"><path :d="logoutIcon" /></svg>
                    </template>
                    Log out
                  </PgButton>
                </div>
              </div>
              <button
                v-else
                ref="logoutItem"
                type="button"
                class="account-item account-item--danger"
                data-testid="account-logout"
                @click="askLogout"
              >
                <svg class="account-item__icon" viewBox="0 -960 960 960" aria-hidden="true">
                  <path :d="logoutIcon" />
                </svg>
                <span>
                  <span class="account-item__label">Log out</span>
                  <span class="account-item__sub">This device only</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useUserStore, useUserSavedAlbumsStore, useUserSavedPlaylistsStore } from '@/data';
import { trapTab } from '@/composables/trapTab';
import { getImageUrl } from '@/utils';
import { logout } from '@/auth';
import PgButton from './PgButton.vue';

defineProps<{
  /** The user profile is still loading: skeletons, but the menu already opens */
  loading?: boolean;
}>();

// Material Symbols "person" (viewBox 0 -960 960 960)
const personIcon =
  'M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z';

const externalIcon = 'm256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z';

// Material Symbols "logout"
const logoutIcon =
  'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z';

const repository = 'https://github.com/kenjiwilkins/phonograph';
const aboutLinks = [
  {
    label: 'Source on GitHub',
    href: repository,
    detail: '',
    testId: 'account-source-link',
    // Material Symbols "code": no brand logos inside the UI
    icon: 'M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z'
  },
  {
    label: 'Changelog',
    // HEAD is the repository's default branch
    href: `${repository}/blob/HEAD/CHANGELOG.md`,
    detail: `v${__APP_VERSION__}`,
    testId: 'account-changelog-link',
    // Material Symbols "history"
    icon: 'M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z'
  }
];

// stores
const userStore = useUserStore();
const userSavedAlbums = useUserSavedAlbumsStore();
const userSavedPlaylists = useUserSavedPlaylistsStore();

// data
const trigger = ref<HTMLButtonElement | null>(null);
const dialog = ref<HTMLElement | null>(null);
const isOpen = ref(false);
// Logging out takes two steps: the item turns into a confirmation panel
const isConfirming = ref(false);
const logoutItem = ref<HTMLButtonElement | null>(null);
const cancelButton = ref<InstanceType<typeof PgButton> | null>(null);

// computed
const user = computed(() => userStore.user);
const triggerImage = computed(() => getImageUrl(user.value?.images, 28));
const profileImage = computed(() => getImageUrl(user.value?.images, 56));
// A total of 0 is also the stores' "not fetched yet"
const stats = computed(() => [
  { label: 'Saved albums', total: userSavedAlbums.totalAlbums, testId: 'account-stat-albums' },
  { label: 'Playlists', total: userSavedPlaylists.totalPlaylists, testId: 'account-stat-playlists' }
]);

// methods
async function open() {
  isConfirming.value = false;
  isOpen.value = true;
  await nextTick();
  dialog.value?.focus();
}

function close() {
  isOpen.value = false;
  trigger.value?.focus();
}

// Focus starts on Cancel, the choice that changes nothing
async function askLogout() {
  isConfirming.value = true;
  await nextTick();
  (cancelButton.value?.$el as HTMLElement | undefined)?.focus();
}

async function cancelLogout() {
  isConfirming.value = false;
  await nextTick();
  logoutItem.value?.focus();
}

function confirmLogout() {
  close();
  logout();
}
</script>

<style scoped>
/*
 * The cut-corner background is drawn on ::before rather than clipping the button itself, so the
 * focus outline isn't clipped away.
 */
.account-chip {
  --cut: var(--chamfer-sm);
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 148px;
  min-height: 44px;
  padding: 0 6px 0 8px;
  border: 0;
  background: none;
  font-family: var(--font-content);
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: var(--ink);
}

.account-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  clip-path: polygon(
    0 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    var(--cut) 100%,
    0 calc(100% - var(--cut))
  );
}

.account-chip:hover::before {
  background: var(--surface-200);
}

.account-chip:hover .account-chip__name {
  text-shadow:
    -1px 0 var(--buzz-red),
    1px 0 var(--buzz-mint);
}

.account-chip[aria-expanded='true']::before {
  background: var(--surface-200);
  box-shadow: inset 0 -2px 0 var(--cyan);
}

.account-chip__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-chip__skeleton {
  width: 72px;
  height: 12px;
}

.account-chip__caret {
  flex: none;
  width: 16px;
  height: 16px;
  fill: var(--ink-muted);
  transition: transform 160ms linear;
}

.account-chip[aria-expanded='true'] .account-chip__caret {
  transform: rotate(180deg);
  fill: var(--cyan);
}

/* Spotify artwork: rounded only, never cropped or clipped */
.account-avatar {
  display: block;
  flex: none;
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: var(--radius-art);
  background-color: var(--surface-300);
}

.account-avatar--lg {
  width: 56px;
  height: 56px;
}

.account-avatar--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-avatar--empty svg {
  width: 60%;
  height: 60%;
  fill: var(--ink-dim);
}

/* the sheet and the open chip are surface-200, the default skeleton colour: step up one */
.account-chip .pg-skel,
.account-profile .pg-skel {
  background-color: var(--surface-300);
}

/* above the tab bar and the app bar */
.account-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--scrim);
  color: var(--ink);
}

/* bottom sheet: chamfer-lg top corners and a quiet 1px edge that follows the cut */
.account-dialog {
  --cut: var(--chamfer-lg);
  --cut-shape: polygon(
    0 var(--cut),
    var(--cut) 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    0 100%
  );
  box-sizing: border-box;
  width: 100%;
  max-width: 32rem;
  margin: 0 auto;
  padding-top: 1px;
  background: var(--line-strong);
  clip-path: var(--cut-shape);
  outline: none;
}

.account-dialog__body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 90dvh;
  overflow-y: auto;
  padding: 12px 16px max(16px, env(safe-area-inset-bottom));
  background: var(--surface-200);
  clip-path: var(--cut-shape);
}

.account-dialog__grab {
  flex: none;
  width: 32px;
  height: 4px;
  margin: 0 auto -4px;
  background: var(--line-strong);
}

.account-dialog__title {
  margin: 0;
  color: var(--ink);
}

.account-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: -12px -12px -12px 0;
  border: 0;
  background: none;
  color: var(--ink-muted);
}

.account-dialog__close:hover {
  color: var(--ink);
}

/* the dialog is clipped to its cut corners: keep the focus ring inside */
.account-dialog__close:focus-visible {
  outline-offset: -6px;
}

.account-dialog__close svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.account-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* wraps to two lines, then truncates */
.account-profile__name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  margin: 0;
  font-family: var(--font-content);
  font-size: 20px;
  font-weight: 800;
  line-height: 26px;
  overflow-wrap: anywhere;
}

.account-profile__id {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.12em;
  color: var(--ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-profile__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--cyan);
}

.account-profile__link:hover {
  color: var(--ink);
}

.account-profile__link svg {
  flex: none;
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.account-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.account-stat {
  --cut: var(--chamfer-sm);
  --fill: var(--surface-200);
  padding: 12px 16px;
}

.account-stat__label {
  color: var(--ink-muted);
}

.account-stat__value {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 24px;
  line-height: 28px;
}

.account-stat__value--pending {
  color: var(--ink-dim);
}

/* a group of menu items under a section label */
.account-section {
  margin: 0 0 4px;
}

.account-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 0 4px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--ink);
}

.account-item:hover {
  background: var(--surface-300);
}

.account-item:hover .account-item__label {
  text-shadow:
    -1px 0 var(--buzz-red),
    1px 0 var(--buzz-mint);
}

.account-item__icon {
  flex: none;
  width: 20px;
  height: 20px;
  fill: var(--ink-muted);
}

.account-item__trail {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: none;
  color: var(--ink-muted);
}

.account-item__trail svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* red text is 4.5:1 on surface-200 but not on surface-300: hover darkens instead */
.account-item--danger {
  box-sizing: border-box;
  width: 100%;
  padding-block: 6px;
  border-width: 0 0 1px;
  background: none;
  text-align: left;
  color: var(--buzz-red);
}

.account-item--danger:hover {
  background: var(--surface-100);
}

.account-item--danger .account-item__icon {
  fill: currentColor;
}

.account-item__label,
.account-item__sub {
  display: block;
}

.account-item__sub {
  margin-top: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: none;
  color: var(--ink-muted);
}

.account-confirm {
  --frame: var(--buzz-red);
  --fill: var(--surface-200);
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
  padding: 16px;
}

.account-confirm__title {
  color: var(--buzz-red);
}

.account-confirm__text {
  margin: 0;
  font-family: var(--font-content);
  font-size: 14px;
  line-height: 20px;
  color: var(--ink-muted);
}

.account-confirm__text b {
  font-weight: 700;
  color: var(--ink);
}

.account-confirm__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  --btn-fill: var(--surface-200);
}

/* popover under the trigger, no scrim */
@media (min-width: 1024px) {
  .account-overlay {
    background: transparent;
  }

  .account-dialog {
    --cut: var(--chamfer-md);
    --cut-shape: polygon(
      0 0,
      calc(100% - var(--cut)) 0,
      100% var(--cut),
      100% 100%,
      var(--cut) 100%,
      0 calc(100% - var(--cut))
    );
    position: absolute;
    top: 64px;
    right: 24px;
    width: 360px;
    padding: 1px;
  }

  .account-dialog__body {
    max-height: calc(100dvh - 80px);
    padding: 16px;
  }

  .account-dialog__grab {
    display: none;
  }
}

/* the sheet slides up over a fading scrim; the popover only fades */
.account-enter-active,
.account-leave-active {
  transition: opacity 0.3s;
}

.account-enter-active .account-dialog,
.account-leave-active .account-dialog {
  transition: transform 0.3s;
}

.account-enter-from,
.account-leave-to {
  opacity: 0;
}

@media (max-width: 1023px) {
  .account-enter-from .account-dialog,
  .account-leave-to .account-dialog {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .account-chip__caret,
  .account-enter-active,
  .account-leave-active,
  .account-enter-active .account-dialog,
  .account-leave-active .account-dialog {
    transition: none;
  }
}
</style>
