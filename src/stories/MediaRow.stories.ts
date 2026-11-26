import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MediaRow from '@/components/MediaRow.vue';
import { albums } from './fixtures';

const meta = {
  title: 'Components/MediaRow',
  component: MediaRow,
  args: {
    title: albums[0].name,
    meta: albums[0].artists[0].name,
    index: 0,
    imageSrc: albums[0].images[0].url
  }
} satisfies Meta<typeof MediaRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Current: Story = { args: { current: true } };
export const Locked: Story = {
  args: { disabled: true, imageSrc: undefined, placeholderIcon: 'playlist' }
};
export const LongTitle: Story = { args: { title: albums[2].name } };
