import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { render } from '@testing-library/vue';
import { flushPromises } from '@vue/test-utils';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import { MockIntersectionObserver } from '../helpers/intersectionObserver';

function mountWith(onLoadMore: () => Promise<void>, canLoadMore: () => boolean) {
  const Host = defineComponent({
    setup() {
      const sentinel = ref<HTMLElement | null>(null);
      useInfiniteScroll(sentinel, onLoadMore, canLoadMore);
      return () => h('div', { ref: sentinel, 'data-testid': 'sentinel' });
    }
  });
  return render(Host);
}

describe('useInfiniteScroll (#122)', () => {
  beforeEach(() => {
    MockIntersectionObserver.install();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('observes the sentinel and loads more when it becomes visible', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    let hasMore = true;
    onLoadMore.mockImplementation(async () => {
      hasMore = false;
    });
    const { getByTestId } = mountWith(onLoadMore, () => hasMore);
    await flushPromises();

    const observer = MockIntersectionObserver.latest();
    expect(observer.elements).toContain(getByTestId('sentinel'));

    observer.trigger(true);
    await flushPromises();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test('does not load when the sentinel is not visible', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    mountWith(onLoadMore, () => true);
    await flushPromises();

    MockIntersectionObserver.latest().trigger(false);
    await flushPromises();
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  test('keeps loading while the sentinel stays visible and more items exist', async () => {
    let pagesLeft = 3;
    const onLoadMore = vi.fn(async () => {
      pagesLeft--;
    });
    mountWith(onLoadMore, () => pagesLeft > 0);
    await flushPromises();

    MockIntersectionObserver.latest().trigger(true);
    await flushPromises();
    expect(onLoadMore).toHaveBeenCalledTimes(3);
  });

  test('does not start a second load while one is running', async () => {
    let resolveLoad!: () => void;
    const onLoadMore = vi.fn(() => new Promise<void>((resolve) => (resolveLoad = resolve)));
    let hasMore = true;
    mountWith(onLoadMore, () => hasMore);
    await flushPromises();

    const observer = MockIntersectionObserver.latest();
    observer.trigger(true);
    observer.trigger(true);
    hasMore = false;
    resolveLoad();
    await flushPromises();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test('disconnects the observer on unmount', async () => {
    const { unmount } = mountWith(vi.fn().mockResolvedValue(undefined), () => true);
    await flushPromises();
    const observer = MockIntersectionObserver.latest();

    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
