import { createApp } from 'vue';
import './index.css';
import App from './App.vue';
import { createPinia } from 'pinia';
const pinia = createPinia();
const instance = createApp(App);
instance.use(pinia);
instance.mount('#app');
