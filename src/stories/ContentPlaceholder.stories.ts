import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ContentPlaceholder from '@/components/ContentPlaceholder.vue';

const meta = {
  title: 'Components/ContentPlaceholder',
  component: ContentPlaceholder
} satisfies Meta<typeof ContentPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneRow: Story = { args: { count: 1 } };
export const FillScreen: Story = {};
