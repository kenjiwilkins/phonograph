import { Ref, watch } from 'vue';

// Safety net in case `onLoadMore` resolves without making progress
const maxConsecutiveLoads = 10;

/**
 * Calls `onLoadMore` when `sentinel` (an element placed after the list) scrolls into view.
 *
 * Replaces window scroll/touchmove listeners: the observer is disconnected automatically
 * when the component unmounts, and nothing runs while the user scrolls elsewhere.
 * If the sentinel is still visible after a page loads (e.g. a short page on a tall screen),
 * it keeps loading until `canLoadMore` returns false.
 */
export function useInfiniteScroll(
  sentinel: Ref<HTMLElement | null>,
  onLoadMore: () => Promise<unknown> | unknown,
  canLoadMore: () => boolean,
  rootMargin = '200px'
) {
  let isVisible = false;
  let isLoading = false;

  async function loadWhileVisible() {
    if (isLoading) return;
    isLoading = true;
    try {
      for (let i = 0; i < maxConsecutiveLoads && isVisible && canLoadMore(); i++) {
        await onLoadMore();
      }
    } finally {
      isLoading = false;
    }
  }

  watch(
    sentinel,
    (element, _previous, onCleanup) => {
      if (!element || typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((entry) => entry.isIntersecting);
          if (isVisible) loadWhileVisible();
        },
        { rootMargin }
      );
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    },
    { immediate: true, flush: 'post' }
  );
}
