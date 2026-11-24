<template>
  <section
    class="flex min-h-screen w-full flex-col items-center justify-center bg-gray-950 text-white"
  >
    <div class="flex max-w-4xl flex-col items-center justify-center px-6 text-center">
      <PhonographLogo size="xl" surge class="mb-8" />
      <p class="mb-12 text-xl whitespace-pre-wrap text-gray-300">
        {{ description }}
      </p>
      <button
        class="mb-4 rounded-lg bg-green-500 px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-green-400"
        @click="getAuth"
      >
        Get Started
      </button>
      <GitHubButton />
    </div>
  </section>
  <footer class="fixed bottom-0 w-full bg-gray-800 py-4 text-center text-gray-400">
    <p>&copy; {{ new Date().getFullYear() }} Michael Kenji Wilkins. All rights reserved.</p>
  </footer>
</template>

<script setup lang="ts">
import { getAuth } from '@/auth';
import GitHubButton from './GitHubButton.vue';
import PhonographLogo from './PhonographLogo.vue';
const description =
  'Your personal music companion.\n Discover, organize, and enjoy your favorite tracks.';
</script>
