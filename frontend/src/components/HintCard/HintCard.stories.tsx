import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HintCard } from './HintCard';

const meta = {
  title: 'Components/HintCard',
  component: HintCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small titled hint card with a heading and a body description. `title` defaults to "Get started"; `description` is required.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      table: { defaultValue: { summary: 'Get started' } },
    },
    description: { control: 'text' },
  },
  args: {
    title: 'Get started',
    description: 'Add your first doctor to begin scheduling appointments.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HintCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: {
    title: 'Next step',
    description: 'Invite your team so they can manage the queue with you.',
  },
};
