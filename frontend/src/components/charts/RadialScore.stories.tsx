import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { RadialScore } from './index';
import { withSize } from '../../sb/decorators';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/Charts/Radial/RadialScore',
  component: RadialScore,
  tags: ['autodocs'],
  decorators: [withSize(200, 200)],
  parameters: {
    docs: {
      description: {
        component:
          'Single-ring radial score gauge (0–100) with a track behind the arc and the numeric score centered.',
      },
    },
  },
  args: {
    size: 180,
    score: 78,
    color: colors.active.shade600,
    trackColor: colors.neutral200,
  },
} satisfies Meta<typeof RadialScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A low score rendered in a warning hue. */
export const LowScore: Story = {
  args: {
    score: 34,
    color: colors.red200,
    trackColor: colors.neutral200,
  },
};
