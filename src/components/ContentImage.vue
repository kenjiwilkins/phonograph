<template>
  <img
    loading="lazy"
    :src="src"
    :alt="alt"
    :height="height"
    :width="width"
    @error="console.error"
    :data-testid="`content-image-${alt}`"
  />
</template>
<script setup lang="ts">
interface Props {
  src: string;
  alt: string;
  height: number;
  width: number;
}

defineProps<Props>();
</script>
