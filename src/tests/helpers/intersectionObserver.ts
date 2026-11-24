import { vi } from 'vitest';

/**
 * Minimal IntersectionObserver mock for jsdom. Like the real API, observing an element
 * reports its current state asynchronously. Call `trigger` to simulate visibility changes.
 */
export class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];
  isIntersecting = false;
  disconnect = vi.fn(() => {
    this.elements = [];
  });

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    instances.push(this);
  }

  observe(element: Element) {
    this.elements.push(element);
    queueMicrotask(() => {
      if (this.elements.includes(element)) this.report([element]);
    });
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter((el) => el !== element);
  }

  trigger(isIntersecting: boolean) {
    this.isIntersecting = isIntersecting;
    this.report(this.elements);
  }

  private report(targets: Element[]) {
    const entries = targets.map((target) => ({ target, isIntersecting: this.isIntersecting }));
    this.callback(entries as unknown as IntersectionObserverEntry[], this as never);
  }

  static latest(): MockIntersectionObserver {
    return instances[instances.length - 1];
  }

  static install() {
    instances.length = 0;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  }
}

const instances: MockIntersectionObserver[] = [];
