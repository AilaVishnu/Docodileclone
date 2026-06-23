import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { RecentBills } from './RecentBills';
import type { Bill } from '../../api/bills';

const noop = () => {};

const SAMPLE: Bill[] = [
  { id: '1', invoiceNo: 'INV_0006', billDate: '2026-06-23', billed: 9, paid: 9, due: 0, refund: 0, depositApplied: 0, payStatus: 'PAID', paymentMethod: 'Cash', items: null, appointmentId: 'a1', createdAt: '2026-06-23T10:00:00Z' },
  { id: '2', invoiceNo: 'INV_0007', billDate: '2026-06-23', billed: 109, paid: 109, due: 0, refund: 0, depositApplied: 0, payStatus: 'PAID', paymentMethod: 'UPI', items: null, appointmentId: 'a1', createdAt: '2026-06-23T11:00:00Z' },
  { id: '3', invoiceNo: 'INV_0008', billDate: '2026-06-23', billed: 9, paid: 9, due: 0, refund: 0, depositApplied: 0, payStatus: 'PAID', paymentMethod: 'Cash', items: null, appointmentId: 'a1', createdAt: '2026-06-23T12:00:00Z' },
];

const meta = {
  title: 'Components/RecentBills',
  component: RecentBills,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The patient's invoice history, shown when the queue's kebab is 'View Bills' (a bill already exists for the day). One row per invoice (no / date / billed / paid / due / refund) with print + open actions; 'Create New Bill' opens the bill editor for another invoice.",
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    patientName: { control: 'text' },
    onClose: { control: false },
    onCreateNew: { control: false },
    onView: { control: false },
    onPrint: { control: false },
  },
  args: {
    isOpen: true,
    patientName: 'Sfsf',
    bills: SAMPLE,
    onClose: noop,
    onCreateNew: noop,
    onView: noop,
    onPrint: noop,
  },
} satisfies Meta<typeof RecentBills>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — three invoices on one day. */
export const Default: Story = {};

/** Empty — no bills yet. */
export const Empty: Story = {
  args: { bills: [] },
};
