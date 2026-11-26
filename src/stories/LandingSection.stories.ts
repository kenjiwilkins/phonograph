import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LandingSection from '@/components/LandingSection.vue';

const meta = {
  title: 'Screens/LandingSection',
  component: LandingSection
} satisfies Meta<typeof LandingSection>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
