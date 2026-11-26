import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PlaylistList from '@/components/PlaylistList.vue';
import { useUserSavedPlaylistsStore } from '@/data';
import { playlists } from './fixtures';

const meta = {
  title: 'Components/PlaylistList',
  component: PlaylistList
} satisfies Meta<typeof PlaylistList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  parameters: { seed: () => useUserSavedPlaylistsStore().addPlaylists(playlists) }
};

export const Empty: Story = {};
