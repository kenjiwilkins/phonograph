/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

const fromRoot = (dir: string) => fileURLToPath(new URL(dir, import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fromRoot('./src'),
      '@assets': fromRoot('./src/assets'),
      '@components': fromRoot('./src/components')
    }
  },
  build: {
    sourcemap: true
  },
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportOnFailure: true,
      include: ['src/**/*.ts', 'src/**/*.vue']
    }
  },
  plugins: [
    vue(),
    sentryVitePlugin({
      org: 'kenji-wilkins',
      project: 'phonograph',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      debug: true,
      // Don't send build telemetry to Sentry
      telemetry: false,
      sourcemaps: {
        filesToDeleteAfterUpload: ['dist:/**/*.map']
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Phonograph - A Spotify Random Album Picker',
        short_name: 'Phonograph',
        description: 'A Spotify Random Album Picker',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ]
});
