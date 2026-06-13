import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Canonical 32px circular icon-only button. Defaults to a ✕ close glyph; pass `children` for a different icon. `ariaLabel` is required for accessibility.',
      },
    },
  },
  argTypes: {
    ariaLabel: { control: 'text' },
    size: {
      control: { type: 'range', min: 24, max: 64, step: 4 },
      table: { defaultValue: { summary: '32' } },
    },
    color: { control: 'color' },
    title: { control: 'text' },
    disabled: { control: 'boolean' },
    onClick: { control: false },
    children: { control: false },
    style: { control: false },
  },
  args: { ariaLabel: 'Close', size: 32 },
  decorators: [
    (Story) => (
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A "+" made by rotating the canonical ✕ close glyph 45° — same stroke weight, no new icon. */
export const Plus: Story = {
  args: { ariaLabel: 'Add', style: { transform: 'rotate(45deg)' } },
};

export const Disabled: Story = { args: { disabled: true } };

export const Large: Story = { args: { size: 48 } };
