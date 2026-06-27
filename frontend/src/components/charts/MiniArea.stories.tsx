import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MiniArea } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/MiniArea',
  component: MiniArea,
  tags: ['autodocs'],
  decorators: [withSize(140, 48)],
  parameters: {
    docs: {
      description: {
        component:
          'Tiny gradient-filled area sparkline for inline trend cues in KPI tiles and table cells.',
      },
    },
  },
  args: {
    width: 120,
    height: 32,
    color: '#2563EB',
    points: [12, 18, 9, 22, 16, 28, 24, 34, 30, 41],
  },
} satisfies Meta<typeof MiniArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A downward sparkline in a warning hue. */
export const Declining: Story = {
  args: {
    color: '#EF4444',
    points: [44, 41, 38, 39, 30, 28, 22, 19, 14, 11],
  },
};
