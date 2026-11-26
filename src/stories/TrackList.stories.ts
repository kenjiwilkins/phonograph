import type { Meta, StoryObj } from '@storybook/vue3-vite';
import TrackList from '@/components/TrackList.vue';
import { useTracksStore, useUserSavedPlaylistsStore } from '@/data';
import { playlists, tracks } from './fixtures';

const meta = {
  title: 'Components/TrackList',
  component: TrackList
} satisfies Meta<typeof TrackList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  parameters: {
    seed: () => {
      useUserSavedPlaylistsStore().setSelectedPlaylist(playlists[0]);
      const store = useTracksStore();
      store.addTracks(tracks);
      store.setSelectedTrack(tracks[1]);
    }
  }
};

export const Empty: Story = {};
