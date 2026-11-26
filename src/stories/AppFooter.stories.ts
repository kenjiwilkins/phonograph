import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AppFooter from '@/components/AppFooter.vue';
import { TabType, useTabStore } from '@/data';

const meta = {
  title: 'Components/AppFooter',
  component: AppFooter
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AlbumsTab: Story = {};
export const PlaylistsTab: Story = {
  parameters: { seed: () => useTabStore().setCurrentTab(TabType.PLAYLIST) }
};
