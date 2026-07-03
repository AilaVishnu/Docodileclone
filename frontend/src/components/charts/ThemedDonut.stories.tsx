import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ThemedDonut } from './index';
import { withSize } from '../../sb/decorators';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/Charts/Radial/ThemedDonut',
  component: ThemedDonut,
  tags: ['autodocs'],
  decorators: [withSize(220, 200)],
  parameters: {
    docs: {
      description: {
        component:
          'Composition donut (diagnosis or payment mix) with hover-to-isolate segments and a center label that swaps to the hovered slice.',
      },
    },
  },
  argTypes: {
    fmtValue: { control: false },
  },
  args: {
    size: 180,
    centerLabel: 'Visits',
    segments: [
      { label: 'General', value: 420, color: colors.active.shade600 },
      { label: 'Dental', value: 180, color: colors.active.shade400 },
      { label: 'Pediatric', value: 140, color: colors.secondary500 },
      { label: 'Dermatology', value: 90, color: colors.active.shade700 },
    ],
  },
} satisfies Meta<typeof ThemedDonut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Payment mix with an explicit center value. */
export const PaymentMix: Story = {
  args: {
    centerLabel: 'Collected',
    centerValue: '₹4.2L',
    segments: [
      { label: 'UPI', value: 220, color: colors.active.shade600 },
      { label: 'Cash', value: 130, color: colors.secondary500 },
      { label: 'Card', value: 90, color: colors.active.shade400 },
    ],
  },
};
