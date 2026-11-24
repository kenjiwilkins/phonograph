import { vi } from 'vitest';

/** Minimal IntersectionObserver mock for jsdom. Call `trigger` to simulate visibility changes. */
export class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];
  disconnect = vi.fn(() => {
    this.elements = [];
  });

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    instances.push(this);
  }

  observe(element: Element) {
    this.elements.push(element);
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter((el) => el !== element);
  }

  trigger(isIntersecting: boolean) {
    const entries = this.elements.map((target) => ({ target, isIntersecting }));
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
