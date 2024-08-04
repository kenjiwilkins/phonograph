<template>
  <ul
    class="flex w-full flex-col gap-2 overflow-hidden py-2"
    data-testid="content-placeholder"
    ref="placeholder"
  >
    <li
      v-for="index in placeholderCount"
      :key="index"
      class="flex w-full gap-2 px-2"
      :data-testid="`placeholder-${index}`"
    >
      <div class="h-16 w-16 animate-pulse rounded-md bg-gray-500"></div>
      <div
        class="flex w-full max-w-full flex-col justify-center gap-4 overflow-x-hidden text-white"
      >
        <p class="h-4 w-1/4 animate-pulse rounded-md bg-gray-500"></p>
        <p class="h-4 w-2/4 animate-pulse rounded-md bg-gray-500"></p>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  contentPlaceholderHeight,
  footerHeight,
  headerHeight,
  playerControllerHeight
} from '@/constants';

// data
const placeholderCount = ref(0);
const placeholder = ref<HTMLUListElement>();

// lifecycle
onMounted(() => {
  if (!placeholder.value) return;
  const rect = placeholder.value.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const placeholderOffset = Math.abs(rect.top - windowHeight);
  placeholderCount.value = Math.ceil(
    (placeholderOffset - footerHeight + headerHeight - playerControllerHeight) /
      contentPlaceholderHeight
  );
});
</script>
