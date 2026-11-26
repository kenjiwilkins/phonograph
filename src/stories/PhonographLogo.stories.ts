import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PhonographLogo from '@/components/PhonographLogo.vue';

const meta = {
  title: 'Components/PhonographLogo',
  component: PhonographLogo,
  parameters: { layout: 'padded' }
} satisfies Meta<typeof PhonographLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = { args: { size: 'md' } };
export const ExtraLarge: Story = { args: { size: 'xl', surge: true } };
