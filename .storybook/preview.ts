import { setup, type Preview } from '@storybook/vue3-vite';
import '@fontsource-variable/orbitron/wght.css';
import '@fontsource/share-tech-mono/400.css';
// Imported statically (unlike main.ts) so screenshots never catch the fallback faces
import '@fontsource/line-seed-jp/400.css';
import '@fontsource/line-seed-jp/700.css';
import '@fontsource/line-seed-jp/800.css';
import '../src/index.css';
import { createStoryPinia } from '../src/stories/store';

setup((app, context) => {
  app.use(createStoryPinia(context?.parameters.seed));
});

const preview: Preview = {
  parameters: {
    layout: 'fullscreen'
  }
};

export default preview;
