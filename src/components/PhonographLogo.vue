<template>
  <h1 :class="['pg-logo', `pg-logo--${size}`, { 'pg-logo--surge': surge }]" :data-text="text">
    {{ text }}
  </h1>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** md: 20px for the app bar; xl: 64px (44px on narrow screens) for the landing page */
    size?: 'md' | 'xl';
    /** Wider buzz with a horizontal tear. Landing page only; never at md. */
    surge?: boolean;
  }>(),
  { size: 'md', surge: false }
);

// The buzz channels are drawn from data-text, so it must match the visible text
const text = 'PHONOGRAPH';
</script>

<style scoped>
.pg-logo {
  position: relative;
  display: inline-block;
  /* keep the z-index: -1/-2 channels inside the logo on any background */
  isolation: isolate;
  margin: 0;
  font-family: var(--font-logo);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
  animation: buzz var(--buzz-cycle) infinite;
}

.pg-logo::before,
.pg-logo::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.pg-logo::before {
  animation: buzz-red var(--buzz-channel) infinite;
  color: var(--buzz-red);
  z-index: -1;
}

.pg-logo::after {
  animation: buzz-mint var(--buzz-channel) infinite;
  color: var(--buzz-mint);
  z-index: -2;
}

.pg-logo--md {
  font-size: 20px;
}

.pg-logo--xl {
  font-size: 44px;
  letter-spacing: 0.04em;
}

@media (min-width: 640px) {
  .pg-logo--xl {
    font-size: 64px;
  }
}

.pg-logo--surge {
  animation-name: surge;
}

.pg-logo--surge::before {
  animation-name: surge-red;
}

.pg-logo--surge::after {
  animation-name: surge-mint;
}

@media (prefers-reduced-motion: reduce) {
  .pg-logo,
  .pg-logo::before,
  .pg-logo::after {
    animation: none;
  }

  /* a still chromatic split */
  .pg-logo::before {
    transform: translate(-1px, 0);
  }

  .pg-logo::after {
    transform: translate(1px, 0);
  }
}

/* The original .glitch keyframes, unchanged */
@keyframes buzz {
  0%,
  74%,
  100% {
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

@keyframes buzz-red {
  0%,
  74%,
  100% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  75% {
    transform: translate(-2px, 2px);
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
  }
}

@keyframes buzz-mint {
  0%,
  74%,
  100% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  75% {
    transform: translate(2px, -2px);
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
  }
}

/* Surge: the same buzz with a wider ±6px throw and a horizontal tear */
@keyframes surge {
  0%,
  70%,
  100% {
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  71% {
    transform: translate(-4px, 0);
    clip-path: inset(0 0 52% 0);
  }
  72% {
    transform: translate(5px, 0);
    clip-path: inset(48% 0 0 0);
  }
  73% {
    transform: translate(-3px, 2px);
    clip-path: inset(20% 0 30% 0);
  }
  74% {
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  88% {
    transform: translate(0);
  }
  89% {
    transform: translate(3px, -2px);
  }
  90% {
    transform: translate(-3px, 2px);
  }
  91% {
    transform: translate(0);
  }
}

@keyframes surge-red {
  0%,
  69%,
  100% {
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  70% {
    transform: translate(-6px, 0);
    clip-path: inset(10% 0 60% 0);
  }
  72% {
    transform: translate(-4px, 1px);
    clip-path: inset(55% 0 20% 0);
  }
  74% {
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  89% {
    transform: translate(-3px, 2px);
    clip-path: inset(0 0 65% 0);
  }
  91% {
    transform: translate(0);
  }
}

@keyframes surge-mint {
  0%,
  69%,
  100% {
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  70% {
    transform: translate(6px, 0);
    clip-path: inset(60% 0 10% 0);
  }
  72% {
    transform: translate(4px, -1px);
    clip-path: inset(25% 0 45% 0);
  }
  74% {
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  89% {
    transform: translate(3px, -2px);
    clip-path: inset(65% 0 0 0);
  }
  91% {
    transform: translate(0);
  }
}
</style>
