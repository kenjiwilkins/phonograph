<template>
  <a
    href="https://github.com/kenjiwilkins/phonograph"
    target="_blank"
    rel="noopener noreferrer"
    :class="customClass || 'flex items-center gap-2 w-fit rounded-md bg-gray-800 px-3 py-2 text-white hover:brightness-110 transition-all'"
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