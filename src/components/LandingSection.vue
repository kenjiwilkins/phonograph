<template>
  <div class="pg-scanlines flex min-h-screen w-full flex-col bg-void text-ink">
    <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-8">
      <div class="flex justify-between gap-4 p-4" data-testid="landing-hud">
        <span class="pg-hud-sm">Sys.boot // v{{ version }}</span>
        <span class="pg-hud-sm text-buzz-mint">● Spotify link ready</span>
      </div>

      <section class="flex flex-col items-start gap-6 px-6" aria-labelledby="landing-title">
        <span class="landing__mark pg-cut">
          <img src="/phonograph.png" alt="" width="112" height="112" />
        </span>
        <div class="flex flex-col gap-3">
          <span class="pg-hud text-volt">// Random album protocol</span>
          <PhonographLogo id="landing-title" size="xl" surge />
          <p class="m-0 max-w-80 font-content text-base leading-6 font-normal text-ink-muted">
            {{ description }}
          </p>
        </div>
        <div class="pg-frame landing__steps w-full">
          <ol class="m-0 flex list-none flex-col gap-2.5 p-4" data-testid="landing-steps">
            <li v-for="(step, index) in steps" :key="step" class="pg-hud flex gap-3">
              <span class="text-volt">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="text-ink">{{ step }}</span>
            </li>
          </ol>
        </div>
      </section>

      <div class="flex flex-col gap-3 px-6">
        <PgButton variant="primary" size="lg" block @click="startAuth">
          Get Started
          <template #keyHint>⏎</template>
        </PgButton>
        <PgButton
          variant="ghost"
          block
          href="https://github.com/kenjiwilkins/phonograph"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="github-button"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6z" />
            </svg>
          </template>
          Star me on GitHub
        </PgButton>
      </div>

      <footer
        class="pg-hud-sm flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-line px-6 py-4"
      >
        <span class="whitespace-nowrap">&copy; {{ year }} Michael Kenji Wilkins</span>
        <span class="whitespace-nowrap">All rights reserved</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAuth } from '@/auth';
import { version } from '../../package.json';
import PgButton from './PgButton.vue';
import PhonographLogo from './PhonographLogo.vue';

const description =
  'Your personal music companion. Discover, organize, and enjoy your favorite tracks.';
const steps = ['Link your Spotify library', 'Roll a random album', 'Press play. No scrolling.'];
const year = new Date().getFullYear();

// Resolve getAuth on click, not at render
function startAuth() {
  getAuth();
}
</script>

<style scoped>
.landing__mark {
  --cut: var(--chamfer-md);
  display: block;
  width: 112px;
  height: 112px;
  background: var(--surface-300);
}

.landing__mark img {
  display: block;
  width: 112px;
  height: 112px;
}

.landing__steps {
  --fill: var(--void);
}
</style>
