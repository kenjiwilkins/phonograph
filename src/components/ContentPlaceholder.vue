<template>
  <!-- Skeleton rows shaped like MediaRow; decorative, so hidden from screen readers -->
  <ul
    class="w-full overflow-hidden"
    aria-hidden="true"
    data-testid="content-placeholder"
    ref="placeholder"
  >
    <li
      v-for="index in placeholderCount"
      :key="index"
      class="skeleton-row"
      :data-testid="`placeholder-${index}`"
    >
      <span class="pg-skel skeleton-art block h-16 w-16"></span>
      <span class="flex min-w-0 flex-col gap-2.5">
        <span class="pg-skel block h-3.5" :style="{ width: widthOf(index).title }"></span>
        <span class="pg-skel block h-3" :style="{ width: widthOf(index).meta }"></span>
      </span>
      <span class="pg-hud-sm self-start pt-0.5">----</span>
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

const props = defineProps<{
  /** Fixed number of rows; by default the rows fill the rest of the screen */
  count?: number;
}>();

// data
const placeholderCount = ref(props.count ?? 0);
const placeholder = ref<HTMLUListElement>();

// Varied bar widths so the skeleton reads as a list of different names
const widths = [
  { title: '46%', meta: '28%' },
  { title: '62%', meta: '34%' },
  { title: '40%', meta: '30%' },
  { title: '70%', meta: '22%' },
  { title: '52%', meta: '36%' },
  { title: '44%', meta: '26%' },
  { title: '58%', meta: '32%' }
];
const widthOf = (index: number) => widths[(index - 1) % widths.length];

// lifecycle
onMounted(() => {
  if (props.count !== undefined || !placeholder.value) return;
  const rect = placeholder.value.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const placeholderOffset = Math.abs(rect.top - windowHeight);
  placeholderCount.value = Math.ceil(
    (placeholderOffset - footerHeight + headerHeight - playerControllerHeight) /
      contentPlaceholderHeight
  );
});
</script>

<style scoped>
/* same box as MediaRow: 64px thumbnail, 12px/16px padding, 1px line */
.skeleton-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
}

/* same shape as the loaded artwork: rounded, never cut */
.skeleton-art {
  border-radius: var(--radius-art);
}
</style>
