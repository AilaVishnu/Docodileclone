import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { CategoryRows } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/CategoryRows',
  component: CategoryRows,
  tags: ['autodocs'],
  decorators: [withSize(360, 90)],
  parameters: {
    docs: {
      description: {
        component:
          'Compact per-row horizontal bars for KPI tiles, each row carrying its own color and a value printed at the end.',
      },
    },
  },
  args: {
    height: 90,
    data: [
      { label: 'New', value: 64, color: '#2563EB' },
      { label: 'Repeat', value: 138, color: '#16A34A' },
      { label: 'Referred', value: 29, color: '#F59E0B' },
    ],
  },
} satisfies Meta<typeof CategoryRows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
