import type { StorybookConfig } from '@storybook/vue3-vite';
import type { PluginOption } from 'vite';

// The app's service worker and Sentry upload have no place in the Storybook build
const appOnlyPlugins = ['vite-plugin-pwa', 'sentry'];

function withoutAppOnlyPlugins(plugins: PluginOption[]): PluginOption[] {
  return plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) return [withoutAppOnlyPlugins(plugin)];
    if (plugin && 'name' in plugin && appOnlyPlugins.some((name) => plugin.name.includes(name))) {
      return [];
    }
    return [plugin];
  });
}

const config: StorybookConfig = {
  framework: '@storybook/vue3-vite',
  stories: ['../src/stories/**/*.stories.ts'],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: withoutAppOnlyPlugins(viteConfig.plugins ?? [])
  })
};

export default config;
