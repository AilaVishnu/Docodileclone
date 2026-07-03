import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClinicDisplayCard } from './ClinicDisplayCard';
import type { Clinic } from '../ClinicTabs';

const sampleClinic: Clinic = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Sunrise Skin Clinic',
  domain: 'sunrise',
  phone: '+91 98765 43210',
  address: '12, MG Road, Bengaluru, Karnataka 560001',
  departments: ['Dermatology', 'General Medicine', 'Pediatrics'],
  staff: [],
};

const noop = () => {};

const meta = {
  title: 'Components/Clinic/ClinicDisplayCard',
  component: ClinicDisplayCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The clinic-selection tile shown on the clinic picker. Renders a `Clinic` with its brand name, domain, phone, departments and address, and a Go to Dashboard button that calls `onSelect(id)`.',
      },
    },
  },
  argTypes: {
    clinic: { control: 'object' },
    onSelect: { control: false },
  },
  args: {
    clinic: sampleClinic,
    onSelect: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClinicDisplayCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A clinic with nothing filled in beyond its name. */
export const Empty: Story = {
  args: {
    clinic: {
      ...sampleClinic,
      phone: '',
      address: '',
      departments: [],
    },
  },
};
