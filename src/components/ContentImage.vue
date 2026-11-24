<template>
  <img
    v-if="src && !hasError"
    loading="lazy"
    :src="src"
    :alt="alt"
    :height="height"
    :width="width"
    @error="handleError"
    :data-testid="`content-image-${alt}`"
  />
  <div
    v-else
    :style="{ height: `${height}px`, width: `${width}px` }"
    class="flex items-center justify-center bg-surface-300"
    :data-testid="`content-image-placeholder-${alt}`"
    :data-placeholder-icon="placeholderIcon"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      class="h-7 w-7 fill-ink-dim"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path :d="placeholderPaths[placeholderIcon]" />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

// props

interface Props {
  src?: string;
  alt: string;
  /** Icon shown when there is no image */
  placeholderIcon?: 'image' | 'playlist';
  height: number;
  width: number;
}

withDefaults(defineProps<Props>(), { src: undefined, placeholderIcon: 'image' });

// Material Symbols paths (viewBox 0 -960 960 960)
const placeholderPaths = {
  image:
    'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z',
  playlist:
    'M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-28-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z'
};

// data

const hasError = ref(false);

// methods

function handleError(error: Event) {
  hasError.value = true;
  console.error(error);
}
</script>
