import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BillCard } from './BillCard';

const SERVICES = [
  { name: 'Ear lobe repair', price: 6000 },
  { name: 'Consultation', price: 500 },
  { name: 'Dressing', price: 400 },
];

const noop = () => {};

const meta = {
  title: 'Components/BillCard',
  component: BillCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The torn-receipt bill summary — service line items, subtotal/discount inputs with %/₹ toggles, a total band and a payment-method radio group. Every value is controlled via a paired `on*Change` prop. Pass `isPaid` to lock the card and stamp it Paid.',
      },
    },
  },
  argTypes: {
    isPaid: { control: 'boolean' },
    paymentMethod: { control: 'inline-radio', options: ['Cash', 'Card', 'UPI', 'Waive'] },
    note: { control: 'text' },
    tax: { control: 'text' },
    total: { control: 'number' },
    subtotal: { control: false },
    discount: { control: false },
    services: { control: false },
    onPaymentMethodChange: { control: false },
    onNoteChange: { control: false },
    onSubtotalChange: { control: false },
    onTaxChange: { control: false },
    onDiscountChange: { control: false },
    onTaxModeChange: { control: false },
    onDiscountModeChange: { control: false },
  },
  args: {
    paymentMethod: 'Cash',
    note: '',
    tax: '0',
    total: 6900,
    isPaid: false,
    services: SERVICES,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled — drive the numeric subtotal/discount fields with local state so
  // the inputs and %/₹ toggles respond. Total is left as a static arg.
  render: (args) => {
    const [subtotal, setSubtotal] = useState(6900);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState(args.paymentMethod);
    React.useEffect(() => setPaymentMethod(args.paymentMethod), [args.paymentMethod]);
    return (
      <BillCard
        {...args}
        subtotal={subtotal}
        onSubtotalChange={setSubtotal}
        discount={discount}
        onDiscountChange={setDiscount}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onNoteChange={noop}
        onTaxChange={noop}
      />
    );
  },
} satisfies Meta<typeof BillCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Paid — inputs are locked and the Paid stamp shows. */
export const Paid: Story = {
  args: { isPaid: true, paymentMethod: 'UPI' },
};

/** No service line items — just the editable totals. */
export const NoServices: Story = {
  args: { services: [] },
};
