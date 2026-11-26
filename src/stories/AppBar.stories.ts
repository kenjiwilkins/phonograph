import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AppBar from '@/components/AppBar.vue';
import { useUserSavedAlbumsStore, useUserStore } from '@/data';
import { user } from './fixtures';

const meta = {
  title: 'Components/AppBar',
  component: AppBar
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function logIn(overrides: Partial<typeof user> = {}) {
  const store = useUserStore();
  store.setUser({ ...user, ...overrides });
  store.setLoggedInState(true);
}

export const LinkOk: Story = { parameters: { seed: () => logIn() } };

export const Syncing: Story = {
  parameters: {
    seed: () => {
      logIn();
      useUserSavedAlbumsStore().setIsLoading(true);
    }
  }
};

export const LongNameWithoutAvatar: Story = {
  parameters: {
    seed: () => logIn({ display_name: 'A listener with a very long display name', images: [] })
  }
};

export const ProfileLoading: Story = { args: { syncing: true } };
export const LoggedOut: Story = {};
