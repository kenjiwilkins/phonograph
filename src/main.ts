import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';
import './index.css';
import App from './App.vue';
import { createPinia } from 'pinia';
const pinia = createPinia();
const instance = createApp(App);
Sentry.init({
  app: instance,
  dsn: 'https://c06db17657f9e563061f51b5cf97f47d@o4505332857700352.ingest.us.sentry.io/4506957397950464',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false
    })
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/phonograph\.vercel\.app/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
instance.use(pinia);
instance.mount('#app');
