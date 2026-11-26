<template>
  <!-- The live region is there before the message, so screen readers announce it -->
  <div class="toast" role="status" aria-live="polite" data-testid="logout-toast">
    <Transition name="toast">
      <div v-if="isVisible" class="pg-frame toast__frame">
        <svg viewBox="0 -960 960 960" aria-hidden="true">
          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
        </svg>
        <span class="pg-hud toast__text">Logged out on this device</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { takeLogoutNotice } from '@/auth/tokenStorage';

const visibleMs = 5000;

const isVisible = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (!takeLogoutNotice()) return;
  isVisible.value = true;
  timer = setTimeout(() => (isVisible.value = false), visibleMs);
});

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.toast {
  position: fixed;
  /* wider than the landing HUD under it (16px padding), so no text peeks out at the cut corner */
  inset: 12px 8px auto;
  z-index: 30;
  max-width: 26rem;
  margin-inline: auto;
  pointer-events: none;
}

.toast__frame {
  --frame: var(--buzz-mint);
  --fill: var(--surface-100);
  --cut: var(--chamfer-sm);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.toast__frame svg {
  flex: none;
  width: 20px;
  height: 20px;
  fill: var(--buzz-mint);
}

.toast__text {
  color: var(--ink);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
