import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ContentImage from '@/components/ContentImage.vue';
import { cover } from './fixtures';

const meta = {
  title: 'Components/ContentImage',
  component: ContentImage,
  parameters: { layout: 'padded' },
  args: { alt: 'Cover', width: 96, height: 96 }
} satisfies Meta<typeof ContentImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = { args: { src: cover('#2f6f8f').url } };
export const Placeholder: Story = {};
export const PlaylistPlaceholder: Story = { args: { placeholderIcon: 'playlist' } };
