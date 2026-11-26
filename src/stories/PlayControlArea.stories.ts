import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PlayControlArea from '@/components/PlayControlArea.vue';
import {
  TabType,
  useTabStore,
  useTracksStore,
  useUserSavedAlbumsStore,
  useUserSavedPlaylistsStore
} from '@/data';
import { albums, playlists, tracks } from './fixtures';

const meta = {
  title: 'Components/PlayControlArea',
  component: PlayControlArea
} satisfies Meta<typeof PlayControlArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Albums: Story = {
  parameters: {
    seed: () => {
      const store = useUserSavedAlbumsStore();
      store.addAlbums(albums);
      store.setTotalAlbums(48);
    }
  }
};

export const Playlists: Story = {
  parameters: {
    seed: () => {
      useTabStore().setCurrentTab(TabType.PLAYLIST);
      const store = useUserSavedPlaylistsStore();
      store.addPlaylists(playlists);
      store.setTotalPlaylists(playlists.length);
    }
  }
};

export const Tracks: Story = {
  parameters: {
    seed: () => {
      useTabStore().setCurrentTab(TabType.PLAYLIST);
      const store = useTracksStore();
      store.addTracks(tracks);
      store.setTotalTracks(42);
    }
  }
};

export const Loading: Story = {};
