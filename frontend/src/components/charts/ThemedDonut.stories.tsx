import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ThemedDonut } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/ThemedDonut',
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
      { label: 'General', value: 420, color: '#2563EB' },
      { label: 'Dental', value: 180, color: '#16A34A' },
      { label: 'Pediatric', value: 140, color: '#F59E0B' },
      { label: 'Dermatology', value: 90, color: '#EF4444' },
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
      { label: 'UPI', value: 220, color: '#7C3AED' },
      { label: 'Cash', value: 130, color: '#0891B2' },
      { label: 'Card', value: 90, color: '#DB2777' },
    ],
  },
};
