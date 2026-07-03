import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { InsetLabelBar } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/Comparison/InsetLabelBar',
  component: InsetLabelBar,
  tags: ['autodocs'],
  decorators: [withSize(440, 200)],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal bar with the category name set inside the bar in a contrast color and the value printed just outside on the right.',
      },
    },
  },
  argTypes: {
    fmtValue: { control: false },
  },
  args: {
    height: 200,
    color: '#7C3AED',
    insetTextColor: '#FFFFFF',
    valueColor: '#1F2937',
    data: [
      { label: 'Fever', value: 312 },
      { label: 'Cough', value: 248 },
      { label: 'Headache', value: 176 },
      { label: 'Fatigue', value: 134 },
    ],
  },
} satisfies Meta<typeof InsetLabelBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
