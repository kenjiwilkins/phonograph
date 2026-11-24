import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';
import './index.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { getSentryOptions } from './monitoring/sentry';

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
