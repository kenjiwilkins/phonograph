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
    <img src="../assets/github.svg" alt="GitHub" class="h-5 w-5" />
    <span>{{ text || 'Star Me!' }}</span>
  </a>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
  customClass?: string;
}

defineProps<Props>();
</script>
