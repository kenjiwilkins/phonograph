<template>
  <section
    class="flex min-h-screen w-full flex-col items-center justify-center bg-gray-950 text-white"
  >
    <div class="max-w-4xl px-6 text-center">
      <h1 class="mb-8 text-6xl font-bold">PHONOGRAPH</h1>
      <p class="mb-12 whitespace-pre-wrap text-xl text-gray-300">
        {{ description }}
      </p>
      <button
        class="rounded-lg bg-green-500 px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-green-400"
        @click="getAuth"
      >
        Get Started
      </button>
    </div>
  </section>
  <footer class="fixed bottom-0 w-full bg-gray-800 py-4 text-center text-gray-400">
    <p>&copy; 2023 Michael Kenji Wilkins. All rights reserved.</p>
  </footer>
</template>

<script setup lang="ts">
import { getAuth } from '@/auth';
const description =
  'Your personal music companion.\n Discover, organize, and enjoy your favorite tracks.';
</script>
