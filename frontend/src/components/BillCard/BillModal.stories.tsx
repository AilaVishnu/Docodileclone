import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BillModal } from './BillModal';

const noop = () => {};

const meta = {
  title: 'Components/Bills/BillModal',
  component: BillModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The full-invoice editor opened from the bill card. A line-item grid (service / qty / unit / GST / discount) on the left, a live summary and split-payment section on the right. Self-contained — it seeds its own line items and patient when none are passed.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    patient: { control: false },
    initialServices: { control: false },
    onClose: { control: false },
  },
  args: {
    isOpen: true,
    onClose: noop,
  },
} satisfies Meta<typeof BillModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — seeds with one line item (Ear lobe repair) and a placeholder patient. */
export const Default: Story = {};

/** Pre-filled with a custom patient and a few services. */
export const WithServices: Story = {
  args: {
    patient: { code: 'T014', name: 'Arjun Mehta', meta: 'M 24' },
    initialServices: [
      { name: 'Consultation', price: 500 },
      { name: 'Dressing', price: 400 },
      { name: 'Suture removal', price: 300 },
    ],
  },
};
