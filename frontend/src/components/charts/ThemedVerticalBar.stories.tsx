import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ThemedVerticalBar } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/ThemedVerticalBar',
  component: ThemedVerticalBar,
  tags: ['autodocs'],
  decorators: [withSize(480, 280)],
  parameters: {
    docs: {
      description: {
        component:
          'Vertical bar chart (revenue per day) with values on top of each bar and an optional highlighted bar via highlightLastIdx.',
      },
    },
  },
  argTypes: {
    fmtValue: { control: false },
  },
  args: {
    height: 280,
    highlightLastIdx: 6,
    data: [
      { label: 'Mon', value: 124000, sub: 'Jun 7' },
      { label: 'Tue', value: 138000, sub: 'Jun 8' },
      { label: 'Wed', value: 96000, sub: 'Jun 9' },
      { label: 'Thu', value: 152000, sub: 'Jun 10' },
      { label: 'Fri', value: 176000, sub: 'Jun 11' },
      { label: 'Sat', value: 212000, sub: 'Jun 12' },
      { label: 'Sun', value: 88000, sub: 'Jun 13' },
    ],
  },
} satisfies Meta<typeof ThemedVerticalBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
