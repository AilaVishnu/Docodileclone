import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ChevronDown } from './ChevronDown';

const meta = {
  title: 'Components/Icons/ChevronDown',
  component: ChevronDown,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Shared down-chevron used by every header selector chip so the affordance is identical everywhere. Rotates 180° when `open` is true.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'number',
      table: { defaultValue: { summary: '16' } },
    },
    open: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    color: { control: 'color' },
    strokeWidth: {
      control: 'number',
      table: { defaultValue: { summary: '1.5' } },
    },
    style: { control: false },
  },
  args: {
    size: 16,
    open: false,
    strokeWidth: 1.5,
  },
} satisfies Meta<typeof ChevronDown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { open: true } };

export const Large: Story = { args: { size: 32 } };

/** Closed vs open. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <ChevronDown size={24} open={false} />
      <ChevronDown size={24} open />
    </div>
  ),
};
