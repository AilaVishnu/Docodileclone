import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ThemedHorizontalBar } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/Comparison/ThemedHorizontalBar',
  component: ThemedHorizontalBar,
  tags: ['autodocs'],
  decorators: [withSize(440, 200)],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal bar chart with category labels on the left and the value printed at the end of each bar — handy for revenue per doctor.',
      },
    },
  },
  argTypes: {
    fmtValue: { control: false },
  },
  args: {
    height: 200,
    color: '#2563EB',
    data: [
      { label: 'Dr. Mehta', value: 184000 },
      { label: 'Dr. Rao', value: 152000 },
      { label: 'Dr. Iyer', value: 121000 },
      { label: 'Dr. Khan', value: 98000 },
    ],
  },
} satisfies Meta<typeof ThemedHorizontalBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
