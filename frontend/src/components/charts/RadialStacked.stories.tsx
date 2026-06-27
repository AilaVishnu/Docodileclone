import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { RadialStacked } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/RadialStacked',
  component: RadialStacked,
  tags: ['autodocs'],
  decorators: [withSize(240, 220)],
  parameters: {
    docs: {
      description: {
        component:
          'Half-arc radial gauge that stacks several segments toward a max total, with a large center value sitting inside the arc.',
      },
    },
  },
  args: {
    size: 220,
    maxTotal: 120,
    centerValue: '86',
    centerLabel: 'In queue',
    segments: [
      { key: 'waiting', value: 42, color: '#F59E0B', label: 'Waiting' },
      { key: 'inProgress', value: 28, color: '#2563EB', label: 'In progress' },
      { key: 'done', value: 16, color: '#16A34A', label: 'Done' },
    ],
  },
} satisfies Meta<typeof RadialStacked>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
