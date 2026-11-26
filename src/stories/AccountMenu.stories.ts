import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AppBar from '@/components/AppBar.vue';
import { useUserSavedAlbumsStore, useUserSavedPlaylistsStore, useUserStore } from '@/data';
import { user } from './fixtures';

// Rendered with the app bar, which holds the trigger; every story opens the menu
const meta = {
  title: 'Components/AccountMenu',
  component: AppBar,
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLElement>('[data-testid="user-button"]')?.click();
  }
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function logIn(overrides: Partial<typeof user> = {}) {
  const store = useUserStore();
  store.setUser({ ...user, ...overrides });
  store.setLoggedInState(true);
  useUserSavedAlbumsStore().setTotalAlbums(412);
  useUserSavedPlaylistsStore().setTotalPlaylists(24);
}

export const Open: Story = { parameters: { seed: () => logIn() } };

export const Loading: Story = { args: { syncing: true } };

export const NoAvatarAndLongName: Story = {
  parameters: {
    seed: () =>
      logIn({
        display_name: 'ながいながい表示名のテストユーザー・夜行列車とシティポップがすきな人です',
        id: 'a.very.long.spotify.user.identifier.2026',
        images: []
      })
  }
};
