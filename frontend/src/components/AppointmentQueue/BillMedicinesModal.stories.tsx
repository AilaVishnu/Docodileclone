import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BillMedicinesModal } from './BillMedicinesModal';

// Item shape: { id, name, dosage?, unitPrice, qty, inStock? }. The last row is
// out of stock — it renders red with an editable unit-price field.
const SAMPLE_MEDICINES = [
  { id: 'm1', name: 'Amoxicillin 500mg', dosage: '1 tab · 1-0-1 · 5 days', unitPrice: 18, qty: 10, inStock: true },
  { id: 'm2', name: 'Cetirizine 10mg', dosage: '1 tab · 0-0-1 · 7 days', unitPrice: 8, qty: 7, inStock: true },
  { id: 'm3', name: 'Calamine Lotion', dosage: 'Apply twice daily', unitPrice: 60, qty: 1, inStock: true },
  { id: 'm4', name: 'Tacrolimus Ointment', dosage: 'Apply at night · 14 days', unitPrice: 0, qty: 1, inStock: false },
];

const noop = () => {};

const meta = {
  title: 'Patterns/AppointmentQueue/BillMedicinesModal',
  component: BillMedicinesModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The dispensary billing modal — a two-card composite (a medicines list on the left, a torn-edge receipt on the right). Rows are quantity-steppable; out-of-stock meds get an editable unit price. Pick Cash / Card / UPI to Charge & Bill, or Waive for a free dispense. Stories render the modal open.",
      },
    },
  },
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
    onBilled: { control: false },
    patientName: { control: 'text' },
    medicines: { control: false },
    loading: { control: 'boolean' },
    catalog: { control: false },
    pendingDue: { control: 'number' },
    pendingDueLabel: { control: 'text' },
  },
  args: {
    isOpen: true,
    onClose: noop,
    patientName: 'Ramesh Babu',
    medicines: SAMPLE_MEDICINES,
    loading: false,
  },
} satisfies Meta<typeof BillMedicinesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Carries an outstanding consultation fee into the bill as a pending-due line. */
export const WithPendingDue: Story = {
  args: {
    pendingDue: 500,
    pendingDueLabel: 'Consultation due',
  },
};

/** Fetching the prescription — the table shows a loading row. */
export const Loading: Story = {
  args: {
    medicines: [],
    loading: true,
  },
};

/** No medicines prescribed yet — empty table with the Add-medicine affordance. */
export const Empty: Story = {
  args: {
    medicines: [],
  },
};
