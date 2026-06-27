import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClinicCard } from './ClinicCard';

const noop = () => {};

const meta = {
  title: 'Components/ClinicCard',
  component: ClinicCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Read-only summary of a clinic — name, domain, phone, departments and address — with optional Edit Details / Go to Dashboard actions. The nested domain field is read-only, so the card makes no network calls.',
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    domain: { control: 'text' },
    phone: { control: 'text' },
    address: { control: 'text' },
    departments: { control: 'object' },
    onGoToDashboard: { control: false },
    onEditDetails: { control: false },
  },
  args: {
    name: 'Sunrise Skin Clinic',
    domain: 'sunrise',
    phone: '+91 98765 43210',
    address: '12, MG Road, Bengaluru, Karnataka 560001',
    departments: ['Dermatology', 'General Medicine'],
    onGoToDashboard: noop,
    onEditDetails: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClinicCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No actions wired — the footer buttons are hidden. */
export const ReadOnly: Story = {
  args: { onGoToDashboard: undefined, onEditDetails: undefined },
};

/** Sparse clinic — no departments or address yet. */
export const Minimal: Story = {
  args: { departments: [], address: '', phone: '' },
};
