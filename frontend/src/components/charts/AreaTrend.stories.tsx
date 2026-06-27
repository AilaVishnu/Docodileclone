import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AreaTrend } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/AreaTrend',
  component: AreaTrend,
  tags: ['autodocs'],
  decorators: [withSize(480, 200)],
  parameters: {
    docs: {
      description: {
        component:
          'Smooth area trend (footfall over time) with a natural curve, soft fill, sparse axes and a themed tooltip; supports one or several stacked series.',
      },
    },
  },
  argTypes: {
    fmtValue: { control: false },
    series: { control: false },
  },
  args: {
    height: 200,
    data: [
      { label: 'Mon', value: 142 },
      { label: 'Tue', value: 168 },
      { label: 'Wed', value: 131 },
      { label: 'Thu', value: 189 },
      { label: 'Fri', value: 224 },
      { label: 'Sat', value: 276 },
      { label: 'Sun', value: 95 },
    ],
  },
} satisfies Meta<typeof AreaTrend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two stacked series — walk-ins vs. appointments. */
export const Stacked: Story = {
  args: {
    data: [
      { label: 'Mon', walkin: 60, appt: 82 },
      { label: 'Tue', walkin: 74, appt: 94 },
      { label: 'Wed', walkin: 51, appt: 80 },
      { label: 'Thu', walkin: 88, appt: 101 },
      { label: 'Fri', walkin: 96, appt: 128 },
      { label: 'Sat', walkin: 120, appt: 156 },
      { label: 'Sun', walkin: 40, appt: 55 },
    ],
    series: [
      { key: 'walkin', label: 'Walk-ins', color: '#2563EB' },
      { key: 'appt', label: 'Appointments', color: '#16A34A' },
    ],
  },
};
