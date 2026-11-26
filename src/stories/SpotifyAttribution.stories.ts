import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SpotifyAttribution from '@/components/SpotifyAttribution.vue';

const meta = {
  title: 'Components/SpotifyAttribution',
  component: SpotifyAttribution
} satisfies Meta<typeof SpotifyAttribution>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
