import { Ref, watch } from 'vue';

/**
 * Calls `onLoadMore` when `sentinel` (an element placed after the list) scrolls into view.
 *
 * Replaces window scroll/touchmove listeners: the observer is disconnected automatically
 * when the component unmounts, and nothing runs while the user scrolls elsewhere.
 *
 * IntersectionObserver only reports changes, so a sentinel that is still visible after a page
 * loads (e.g. a short page on a tall screen) wouldn't trigger again. After each load the
 * sentinel is observed again: observing reports the current state, so loading continues only
 * while it is really visible. Reports arrive with the next frame, so this never spins.
 */
export function useInfiniteScroll(
  sentinel: Ref<HTMLElement | null>,
  onLoadMore: () => Promise<unknown> | unknown,
  canLoadMore: () => boolean,
  rootMargin = '200px'
) {
  let isLoading = false;

  watch(
    sentinel,
    (element, _previous, onCleanup) => {
      if (!element || typeof IntersectionObserver === 'undefined') return;
      let active = true;
      const observer = new IntersectionObserver(
        async (entries) => {
          const isVisible = entries.some((entry) => entry.isIntersecting);
          if (!isVisible || isLoading || !canLoadMore()) return;
          isLoading = true;
          try {
            await onLoadMore();
          } finally {
            isLoading = false;
          }
          if (active && canLoadMore()) {
            observer.unobserve(element);
            observer.observe(element);
          }
        },
        { rootMargin }
      );
      observer.observe(element);
      onCleanup(() => {
        active = false;
        observer.disconnect();
      });
    },
    { immediate: true, flush: 'post' }
  );
}
