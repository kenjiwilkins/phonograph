import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PgButton from '@/components/PgButton.vue';

const meta = {
  title: 'Components/PgButton',
  component: PgButton,
  parameters: { layout: 'padded' }
} satisfies Meta<typeof PgButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const gallery = (template: string): Story => ({
  render: () => ({
    components: { PgButton },
    template: `<div class="flex flex-col items-start gap-3">${template}</div>`
  })
});

export const Variants = gallery(`
  <PgButton variant="primary">Primary</PgButton>
  <PgButton variant="ghost">Ghost</PgButton>
  <PgButton variant="text">Text</PgButton>
  <PgButton variant="danger">Danger</PgButton>
  <PgButton variant="primary" size="lg">Primary large</PgButton>
  <PgButton variant="ghost" size="lg">Ghost large</PgButton>
`);

export const BlockWithKeyHint = gallery(`
  <PgButton variant="primary" size="lg" block key-hint="return">Get started</PgButton>
  <PgButton variant="ghost" block key-hint="external" href="#">Open elsewhere</PgButton>
`);

export const WithIcon = gallery(`
  <PgButton>
    <template #icon><svg viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" /></svg></template>
    Play
  </PgButton>
`);

export const Inactive = gallery(`
  <PgButton disabled>Disabled</PgButton>
  <PgButton variant="ghost" disabled>Disabled ghost</PgButton>
  <PgButton variant="danger" disabled>Disabled danger</PgButton>
  <PgButton loading>Hidden label</PgButton>
`);
