<template>
  <a
    href="https://github.com/kenjiwilkins/phonograph"
    target="_blank"
    rel="noopener noreferrer"
    :class="
      customClass ||
      'flex w-fit items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-white transition-all hover:brightness-110'
    "
    data-testid="github-button"
  >
    <!-- A plain star instead of the GitHub mark: no brand logos inside the UI -->
    <svg
      class="h-5 w-5 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-testid="github-star-icon"
    >
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6z" />
    </svg>
    <span>{{ text || 'Star Me!' }}<span class="sr-only"> on GitHub</span></span>
  </a>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
  customClass?: string;
}

defineProps<Props>();
</script>
