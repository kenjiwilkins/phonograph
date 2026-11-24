<template>
  <component
    :is="href ? 'a' : 'button'"
    :class="[
      'pg-btn',
      `pg-btn--${variant}`,
      `pg-btn--${size}`,
      { 'pg-btn--block': block, 'pg-btn--loading': loading, 'pg-btn--disabled': inactive }
    ]"
    v-bind="elementAttrs"
  >
    <span v-if="$slots.icon" class="pg-btn__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="pg-btn__label">
      <template v-if="loading">Loading</template>
      <slot v-else />
    </span>
    <span v-if="$slots.keyHint" class="pg-btn__key"><slot name="keyHint" /></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** primary: the one volt action per view; ghost: cyan frame; text: quiet ink-muted */
    variant?: 'primary' | 'ghost' | 'text';
    /** md: 44px; lg: 56px */
    size?: 'md' | 'lg';
    /** full width, label left and key hint right */
    block?: boolean;
    /** animated hazard stripes, label becomes LOADING, not clickable */
    loading?: boolean;
    disabled?: boolean;
    /** renders an <a> instead of a <button> */
    href?: string;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    loading: false,
    disabled: false,
    href: undefined,
    type: 'button'
  }
);

const inactive = computed(() => props.disabled || props.loading);

const elementAttrs = computed(() => {
  if (props.href) {
    // A link can't be disabled; drop the href so it can't be followed or focused
    return inactive.value
      ? { 'aria-disabled': 'true', 'aria-busy': props.loading || undefined }
      : { href: props.href };
  }
  return {
    type: props.type,
    disabled: inactive.value,
    'aria-busy': props.loading || undefined
  };
});
</script>

<style scoped>
/*
 * The cut-corner shape is drawn on ::before (and the ghost's inner fill on ::after) rather than
 * clipping the element itself, so the focus outline isn't clipped away.
 */
.pg-btn {
  --cut: var(--chamfer-sm);
  --cut-shape: polygon(
    0 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    var(--cut) 100%,
    0 calc(100% - var(--cut))
  );
  --btn-bg: transparent;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border: 0;
  background: none;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.pg-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--btn-bg);
  clip-path: var(--cut-shape);
}

.pg-btn--lg {
  height: 56px;
  padding: 0 24px;
  font-size: 15px;
}

.pg-btn--block {
  display: flex;
  width: 100%;
  justify-content: flex-start;
}

.pg-btn--block .pg-btn__key {
  margin-left: auto;
}

.pg-btn__icon {
  display: inline-flex;
  flex: none;
}

.pg-btn__icon :deep(svg),
.pg-btn__icon :deep(img) {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.pg-btn__key {
  padding: 2px 4px;
  border: 1px solid currentColor;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
  letter-spacing: 0.16em;
  opacity: 0.72;
}

/* primary: volt fill */
.pg-btn--primary {
  --btn-bg: var(--volt);
  color: var(--on-volt);
}

.pg-btn--primary:active {
  --btn-bg: var(--volt-deep);
}

/* ghost: 1px cyan line that follows the cut; set --btn-fill when it sits on a raised panel */
.pg-btn--ghost {
  --btn-bg: var(--cyan);
  color: var(--cyan);
}

.pg-btn--ghost::after {
  content: '';
  position: absolute;
  inset: 1px;
  z-index: -1;
  background: var(--btn-fill, var(--void));
  clip-path: polygon(
    0 0,
    calc(100% - var(--cut) + 0.4px) 0,
    100% calc(var(--cut) - 0.4px),
    100% 100%,
    calc(var(--cut) - 0.4px) 100%,
    0 calc(100% - var(--cut) + 0.4px)
  );
}

/* text: quiet */
.pg-btn--text {
  color: var(--ink-muted);
}

.pg-btn--text:hover {
  color: var(--ink);
}

/* hover = the buzz: a short jitter and a red/mint split, no colour change */
.pg-btn--primary:hover,
.pg-btn--ghost:hover {
  animation: pg-btn-jitter var(--hover-buzz) steps(3) 1;
  text-shadow:
    -2px 0 var(--buzz-red),
    2px 0 var(--buzz-mint);
}

/* disabled / loading: hazard stripes (static when disabled, moving when loading) */
.pg-btn--disabled,
.pg-btn--disabled:hover {
  --btn-bg: repeating-linear-gradient(
    135deg,
    var(--surface-200) 0 8px,
    var(--surface-300) 8px 16px
  );
  color: var(--ink-dim);
  text-shadow: none;
  animation: none;
  cursor: default;
}

.pg-btn--disabled::after {
  display: none;
}

.pg-btn--disabled::before {
  /* one 16px stripe pitch at 135deg spans 16√2 ≈ 22.6px horizontally, so the tile repeats seamlessly */
  background-size: 22.6px 22.6px;
}

.pg-btn--loading {
  color: var(--ink-muted);
}

.pg-btn--loading::before {
  animation: pg-btn-stripes 0.8s linear infinite;
}

@keyframes pg-btn-jitter {
  0% {
    transform: translate(0);
  }
  33% {
    transform: translate(-2px, 1px);
  }
  66% {
    transform: translate(2px, -1px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes pg-btn-stripes {
  to {
    background-position: 22.6px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pg-btn,
  .pg-btn:hover,
  .pg-btn::before {
    animation: none;
  }
}
</style>
