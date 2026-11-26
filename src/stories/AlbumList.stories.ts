import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AlbumList from '@/components/AlbumList.vue';
import { useUserSavedAlbumsStore } from '@/data';
import { albums } from './fixtures';

const meta = {
  title: 'Components/AlbumList',
  component: AlbumList
} satisfies Meta<typeof AlbumList>;

export default meta;
type Story = StoryObj<typeof meta>;

function loaded() {
  useUserSavedAlbumsStore().addAlbums(albums);
}

export const Loaded: Story = { parameters: { seed: loaded } };

export const LoadingMore: Story = {
  parameters: {
    seed: () => {
      loaded();
      useUserSavedAlbumsStore().setIsLoading(true);
    }
  }
};

export const Empty: Story = {};
