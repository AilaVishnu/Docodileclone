import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PayBadge } from './StatusBadge';

// Two states: PAID and DUE. Any non-paid value (UNPAID / "NO PAY" / unknown)
// renders as "Due", so the catalog shows the two real outcomes.
const STATUSES = ['PAID', 'DUE'] as const;

const meta = {
  title: 'Components/PayBadge',
  component: PayBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Icon-only payment indicator for the queue — a check circle for PAID, a danger triangle for DUE (any non-paid status renders as Due). The label is exposed only via the native hover tooltip.',
      },
    },
  },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
  },
  args: {
    status: 'PAID',
  },
} satisfies Meta<typeof PayBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paid: Story = {};

export const Due: Story = { args: { status: 'DUE' } };

/** All pay states side by side (hover for the label). */
export const AllStatuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {STATUSES.map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <PayBadge status={s} />
          <div style={{ fontSize: 12, marginTop: 4 }}>{s}</div>
        </div>
      ))}
    </div>
  ),
};
