import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { RadialStacked } from './index';
import { withSize } from '../../sb/decorators';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/Charts/Radial/RadialStacked',
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
      { key: 'waiting', value: 42, color: colors.active.shade400, label: 'Waiting' },
      { key: 'inProgress', value: 28, color: colors.active.shade600, label: 'In progress' },
      { key: 'done', value: 16, color: colors.secondary500, label: 'Done' },
    ],
  },
} satisfies Meta<typeof RadialStacked>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
