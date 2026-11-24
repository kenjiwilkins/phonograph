import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';
import '@fontsource-variable/orbitron/wght.css';
import '@fontsource/share-tech-mono/400.css';
import './index.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { getSentryOptions } from './monitoring/sentry';

// LINE Seed JP ships ~120 unicode-range slices per weight (~200 kB gzip of @font-face rules).
// Load them as a separate stylesheet so they don't block the first render; text shows in the
// fallback faces of --font-content until then.
void Promise.all([
  import('@fontsource/line-seed-jp/400.css'),
  import('@fontsource/line-seed-jp/700.css'),
  import('@fontsource/line-seed-jp/800.css')
]);

const pinia = createPinia();
const instance = createApp(App);
const { replayOptions, ...sentryOptions } = getSentryOptions({
  production: import.meta.env.PROD
});
Sentry.init({
  app: instance,
  ...sentryOptions,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration(replayOptions)]
});
instance.use(pinia);
instance.mount('#app');
