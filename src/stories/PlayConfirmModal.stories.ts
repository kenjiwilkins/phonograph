import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PlayConfirmModal from '@/components/PlayConfirmModal.vue';
import { useTracksStore, useUserSavedAlbumsStore } from '@/data';
import { albums, tracks } from './fixtures';

const meta = {
  title: 'Components/PlayConfirmModal',
  component: PlayConfirmModal
} satisfies Meta<typeof PlayConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function selectAlbum(index: number) {
  const store = useUserSavedAlbumsStore();
  store.addAlbums(albums);
  store.setTotalAlbums(48);
  store.setSelectedAlbum(albums[index]);
}

export const Album: Story = { parameters: { seed: () => selectAlbum(0) } };
export const LongTitle: Story = { parameters: { seed: () => selectAlbum(2) } };

export const Track: Story = {
  parameters: {
    seed: () => {
      const store = useTracksStore();
      store.addTracks(tracks);
      store.setTotalTracks(42);
      store.setSelectedTrack(tracks[1]);
    }
  }
};
