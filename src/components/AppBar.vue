<template>
  <header
    id="app-bar"
    class="sticky top-0 flex h-16 w-full items-center justify-between bg-black px-6 py-4"
  >
    <h1 class="text-xl font-bold text-white" data-testid="logo">PHONOGRAPH</h1>
    <button
      v-if="loggedIn"
      class="bg-black-900 flex gap-2 px-2 py-2 text-white hover:brightness-125"
      data-testid="user-button"
    >
      <img :src="user?.images[0]?.url" :alt="user?.display_name" class="h-6 w-6 rounded-full" />
      <span>{{ user?.display_name }}</span>
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
