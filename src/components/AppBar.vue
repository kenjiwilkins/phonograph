<template>
  <header
    id="app-bar"
    class="sticky top-0 flex h-16 w-full items-center justify-between bg-black px-6 py-4"
  >
    <h1 class="text-xl font-bold text-white glitch" data-testid="logo" data-text="PHONOGRAPH">PHONOGRAPH</h1>
    <button
      v-if="loggedIn"
      class="bg-black-900 flex gap-2 px-2 py-2 text-white hover:brightness-125"
      data-testid="user-button"
    >
      <img :src="user?.images[0]?.url" :alt="user?.display_name" class="h-6 w-6 rounded-full" />
      <span class="max-w-32 truncate">{{ user?.display_name }}</span>
    </button>
    <button
      v-else
      class="flex gap-2 rounded-md bg-gray-800 px-2 py-1 text-white hover:brightness-110"
      data-testid="login-button"
    >
      Login
    </button>
  </header>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '../data';

// store
const userStore = useUserStore();

// computed
const user = computed(() => userStore.user);
const loggedIn = computed(() => userStore.loggedInState);
</script>

<style scoped>
.glitch {
  position: relative;
  animation: glitch 2s infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-1 0.5s infinite;
  color: #ff0040;
  z-index: -1;
}

.glitch::after {
  animation: glitch-2 0.5s infinite;
  color: #00ff9f;
  z-index: -2;
}

@keyframes glitch {
  0%, 74%, 100% {
    transform: translate(0);
  }
  75% {
    transform: translate(-2px, 2px);
  }
  76% {
    transform: translate(2px, -2px);
  }
  77% {
    transform: translate(-2px, -2px);
  }
  78% {
    transform: translate(2px, 2px);
  }
  79% {
    transform: translate(-2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
}

@keyframes glitch-1 {
  0%, 74%, 100% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  75% {
    transform: translate(-2px, 2px);
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
  }
}

@keyframes glitch-2 {
  0%, 74%, 100% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  75% {
    transform: translate(2px, -2px);
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
  }
}
</style>
