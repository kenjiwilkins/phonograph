// Node 25+ ships its own global `localStorage`, which is undefined unless Node is started with
// --localstorage-file, and it shadows jsdom's. Use jsdom's storage so tests behave like a browser.
const jsdom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (jsdom && typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: jsdom.window.localStorage,
    configurable: true,
    writable: true
  });
}
