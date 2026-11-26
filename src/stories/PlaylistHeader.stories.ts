import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PlaylistHeader from '@/components/PlaylistHeader.vue';
import { useUserSavedPlaylistsStore } from '@/data';
import { playlists } from './fixtures';

const meta = {
  title: 'Components/PlaylistHeader',
  component: PlaylistHeader
} satisfies Meta<typeof PlaylistHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: { seed: () => useUserSavedPlaylistsStore().setSelectedPlaylist(playlists[0]) }
};

export const LongName: Story = {
  parameters: {
    seed: () =>
      useUserSavedPlaylistsStore().setSelectedPlaylist({
        ...playlists[0],
        name: 'A playlist with a name far too long to fit on a phone screen'
      })
  }
};
