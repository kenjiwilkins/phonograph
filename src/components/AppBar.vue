<template>
  <header
    id="app-bar"
    class="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-3 border-b border-line bg-surface-100 px-4"
  >
    <PhonographLogo size="md" data-testid="logo" />
    <div class="flex min-w-0 items-center gap-3">
      <span
        v-if="status"
        role="status"
        :class="['pg-hud app-bar__status', `app-bar__status--${status.tone}`]"
        data-testid="link-status"
      >
        {{ status.label }}
      </span>
      <!-- Shows who is signed in; it has no action, so it isn't a button (no dead tab stop) -->
      <div
        v-if="loggedIn"
        class="flex min-w-0 items-center gap-2 font-content text-sm font-bold text-ink"
        data-testid="user-button"
      >
        <!-- The name is shown next to it, so the avatar is decorative -->
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="pg-cut app-bar__avatar" />
        <span v-else class="pg-cut app-bar__avatar" aria-hidden="true"></span>
        <span class="max-w-32 truncate">{{ user?.display_name }}</span>
      </div>
      <PgButton v-else-if="!syncing" variant="ghost" data-testid="login-button">Login</PgButton>
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore, useUserSavedAlbumsStore } from '../data';
import { getImageUrl } from '@/utils';
import PhonographLogo from './PhonographLogo.vue';
import PgButton from './PgButton.vue';

const props = defineProps<{
  /** Authenticated, but the user profile is still loading: show SYNC instead of LOGIN */
  syncing?: boolean;
}>();

// store
const userStore = useUserStore();
const userSavedAlbums = useUserSavedAlbumsStore();

// computed
const user = computed(() => userStore.user);
const loggedIn = computed(() => userStore.loggedInState);
const avatarUrl = computed(() => getImageUrl(user.value?.images, 28));

/**
 * Link status derived from the existing stores: LINK OK once the user is loaded, SYNC while the
 * saved albums are loading (or, via the syncing prop, while the user profile loads). The stores
 * can't tell an auth error apart from not being logged in yet, so there is no LINK LOST state;
 * logged out shows no status.
 */
const status = computed(() => {
  if (!loggedIn.value) {
    return props.syncing ? ({ label: 'Sync', tone: 'sync' } as const) : null;
  }
  if (userSavedAlbums.isLoading) return { label: 'Sync', tone: 'sync' } as const;
  return { label: 'Link ok', tone: 'ok' } as const;
});
</script>

<style scoped>
.app-bar__status {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
}

.app-bar__status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}

.app-bar__status--ok {
  color: var(--buzz-mint);
}

.app-bar__status--ok::before {
  box-shadow: var(--glow-mint);
}

.app-bar__status--sync {
  color: var(--cyan);
}

.app-bar__status--sync::before {
  box-shadow: var(--glow-cyan);
}

.app-bar__avatar {
  --cut: 6px;
  display: block;
  flex: none;
  width: 28px;
  height: 28px;
  object-fit: cover;
  background: var(--surface-300);
}
</style>
