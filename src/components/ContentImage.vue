<template>
  <img
    v-if="!hasError"
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
    class="flex w-full animate-pulse items-center justify-center bg-gray-300"
    :data-testid="`content-image-placeholder-${alt}`"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      class="h-10 w-10 text-gray-200"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path
        d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

// props

interface Props {
  src: string;
  alt: string;
  height: number;
  width: number;
}

defineProps<Props>();

// data

const hasError = ref(false);

// methods

function handleError(error: Event) {
  hasError.value = true;
  console.error(error);
}
</script>
