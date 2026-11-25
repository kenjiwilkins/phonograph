<template>
  <button
    type="button"
    class="media-row"
    :aria-current="current ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <span class="media-row__thumb">
      <ContentImage
        :src="imageSrc"
        :alt="imageAlt ?? title"
        :placeholder-icon="placeholderIcon"
        :height="64"
        :width="64"
        v-bind="imageTestId ? { 'data-testid': imageTestId } : {}"
      />
    </span>
    <span class="media-row__text">
      <span class="media-row__title" :data-testid="titleTestId">{{ title }}</span>
      <span v-if="meta || $slots.meta" class="media-row__meta" :data-testid="metaTestId"
        ><slot name="meta">{{ meta }}</slot></span
      >
    </span>
    <span v-if="disabled" class="pg-tag pg-tag--red media-row__tag">Locked</span>
    <span v-else-if="index !== undefined" class="pg-hud-sm media-row__index"
      ><span v-if="current" aria-hidden="true">▶ </span>#{{ paddedIndex }}</span
    >
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ContentImage from './ContentImage.vue';

const props = withDefaults(
  defineProps<{
    /** Name from the Spotify API, shown as written */
    title: string;
    /** Second line: artist, owner, track count, or "Album · Artist" */
    meta?: string;
    /** Zero-based position in the list; shown one-based as #0001 */
    index?: number;
    imageSrc?: string;
    /** Icon shown when there is no image */
    placeholderIcon?: 'image' | 'playlist';
    /** Defaults to the title */
    imageAlt?: string;
    /** The item open in the play sheet */
    current?: boolean;
    /** An item Spotify won't play (e.g. a playlist without readable tracks): shows LOCKED */
    disabled?: boolean;
    imageTestId?: string;
    titleTestId?: string;
    metaTestId?: string;
  }>(),
  {
    meta: undefined,
    index: undefined,
    imageSrc: undefined,
    placeholderIcon: 'image',
    imageAlt: undefined,
    current: false,
    disabled: false,
    imageTestId: undefined,
    titleTestId: undefined,
    metaTestId: undefined
  }
);

const paddedIndex = computed(() => String((props.index ?? 0) + 1).padStart(4, '0'));
</script>

<style scoped>
.media-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font: inherit;
  text-align: left;
}

/* inside the scrolling list, keep the focus ring within the row */
.media-row:focus-visible {
  outline-offset: -2px;
}

.media-row__thumb {
  position: relative;
  display: block;
  width: 64px;
  height: 64px;
}

.media-row__thumb :deep(img),
.media-row__thumb :deep(div) {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: var(--radius-art);
}

/* corner brackets */
.media-row__thumb::before,
.media-row__thumb::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 0 solid var(--line-strong);
  pointer-events: none;
}

.media-row__thumb::before {
  top: -8px;
  left: -8px;
  border-top-width: 2px;
  border-left-width: 2px;
}

.media-row__thumb::after {
  right: -8px;
  bottom: -8px;
  border-right-width: 2px;
  border-bottom-width: 2px;
}

.media-row__text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  font-family: var(--font-content);
}

.media-row__title,
.media-row__meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-row__title {
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
}

.media-row__meta {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ink-muted);
}

.media-row__index,
.media-row__tag {
  align-self: start;
  margin-top: 2px;
  white-space: nowrap;
}

/* hover / focus: lit ground, volt brackets and index, red/mint split on the title */
.media-row:not([aria-disabled='true']):is(:hover, :focus-visible) {
  background: var(--surface-100);
}

.media-row:not([aria-disabled='true']):is(:hover, :focus-visible) .media-row__thumb::before,
.media-row:not([aria-disabled='true']):is(:hover, :focus-visible) .media-row__thumb::after {
  border-color: var(--volt);
}

.media-row:not([aria-disabled='true']):is(:hover, :focus-visible) .media-row__index {
  color: var(--volt);
}

.media-row:not([aria-disabled='true']):is(:hover, :focus-visible) .media-row__title {
  text-shadow:
    -1px 0 var(--buzz-red),
    1px 0 var(--buzz-mint);
}

/* current: the item in the play sheet */
.media-row[aria-current='true'] .media-row__thumb::before,
.media-row[aria-current='true'] .media-row__thumb::after {
  border-color: var(--buzz-mint);
}

.media-row[aria-current='true'] .media-row__index {
  color: var(--buzz-mint);
}

/* disabled: dimmed, LOCKED, no hover */
.media-row[aria-disabled='true'] {
  cursor: not-allowed;
}

.media-row[aria-disabled='true'] .media-row__thumb,
.media-row[aria-disabled='true'] .media-row__title {
  opacity: 0.45;
}
</style>
