<template>
  <div
    id="app-bar"
    class="flex justify-between items-center h-16 bg-black py-4 px-6 w-full"
  >
    <h1 class="font-bold text-xl text-white">PHONOGRAPH</h1>
    <button
      v-if="loggedIn"
      class="flex py-2 px-2 bg-black-900 gap-2 text-white hover:brightness-125"
    >
      <img
        :src="user?.images[0]?.url"
        :alt="user?.display_name"
        class="rounded-full h-6 w-6"
      />
      <span>{{ user?.display_name }}</span>
    </button>
    <button
      v-else
      class="flex py-1 px-2 bg-gray-800 rounded-md gap-2 text-white hover:brightness-110"
    >
      Login
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "../data";
const userStore = useUserStore();
const user = computed(() => userStore.user);
const loggedIn = computed(() => userStore.loggedInState);
</script>
