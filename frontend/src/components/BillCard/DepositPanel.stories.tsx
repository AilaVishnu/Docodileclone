import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DepositPanel } from './DepositPanel';

const noop = () => {};

const meta = {
  title: 'Components/Bills/DepositPanel',
  component: DepositPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The "Deposit Amount" drawer that wraps over the bill\'s right column (Bills Summary + Payment) when the "+" beside Deposit Amount is clicked. Reuses the same payment-row the bill uses (mode Select + ₹ MeasureField + inline +/trash), the shared Tabs (Add Deposit / Refund), a Field and the dark button. "Pay" applies the total as the bill deposit; the Refund tab subtracts from it. It is a card sized to fill BillLayout\'s right column — the story frames it in a fixed box.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 460 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    deposited: { control: 'number' },
    onClose: { control: false },
    onApply: { control: false },
    onRefund: { control: false },
  },
  args: {
    deposited: 11111,
    onClose: noop,
    onApply: noop,
    onRefund: noop,
  },
} satisfies Meta<typeof DepositPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — ₹11,111 already deposited, with one empty Cash row. */
export const Default: Story = {};

/** Nothing deposited yet — the band reads ₹0.00. */
export const Settled: Story = {
  args: { deposited: 0 },
};
