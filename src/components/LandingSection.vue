<template>
  <section
    class="flex min-h-screen w-full flex-col items-center justify-center bg-gray-950 text-white"
  >
    <div class="flex flex-col items-center justify-center max-w-4xl px-6 text-center">
      <h1 class="mb-8 text-4xl sm:text-5xl md:text-6xl font-bold glitch" data-text="PHONOGRAPH">PHONOGRAPH</h1>
      <p class="mb-12 whitespace-pre-wrap text-xl text-gray-300">
        {{ description }}
      </p>
      <button
        class="rounded-lg bg-green-500 mb-4 px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-green-400"
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
const description =
  'Your personal music companion.\n Discover, organize, and enjoy your favorite tracks.';
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
