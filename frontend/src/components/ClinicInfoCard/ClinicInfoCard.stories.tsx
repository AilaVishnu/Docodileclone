import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClinicInfoCard } from './ClinicInfoCard';
import { withClinicSession } from '../../sb/decorators';
import type { Clinic } from '../ClinicTabs';

// A not-yet-saved clinic uses a non-UUID id, which keeps the domain field
// editable and the live availability check running (covered by the default
// MSW handler for /api/tenant/domain/check → { available: true }).
const newClinic: Clinic = {
  id: 'new-clinic',
  name: 'Sunrise Skin Clinic',
  domain: 'sunrise',
  phone: '+91 98765 43210',
  address: '12, MG Road, Bengaluru, Karnataka 560001',
  departments: ['Dermatology', 'General Medicine'],
  staff: [],
};

// A saved clinic uses a UUID id, which permanently locks the domain field.
const savedClinic: Clinic = {
  ...newClinic,
  id: '11111111-1111-1111-1111-111111111111',
};

const noop = () => {};

const meta = {
  title: 'Components/Clinic/ClinicInfoCard',
  component: ClinicInfoCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
    withClinicSession,
  ],
  parameters: {
    docs: {
      description: {
        component:
          'The always-editable clinic setup form — name, phone, departments (with autocomplete) and address, plus a domain "nick name" field with a live availability check (debounced GET /api/tenant/domain/check). Edits flow up via `onUpdate`. The domain locks once the clinic is saved (UUID id).',
      },
    },
  },
  argTypes: {
    clinic: { control: 'object' },
    onUpdate: { control: false },
    onShowToast: { control: false },
  },
  args: {
    clinic: newClinic,
    onShowToast: noop,
  },
  // Self-contained editing — apply onUpdate patches to local state so the form
  // is interactive (typing, adding/removing departments).
  render: (args) => {
    const [clinic, setClinic] = useState<Clinic>(args.clinic);
    React.useEffect(() => setClinic(args.clinic), [args.clinic]);
    return (
      <ClinicInfoCard
        {...args}
        clinic={clinic}
        onUpdate={(updates) => setClinic((c) => ({ ...c, ...updates }))}
      />
    );
  },
} satisfies Meta<typeof ClinicInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** New clinic — domain is editable and shows "Available" via the live check. */
export const NewClinic: Story = {};

/** Saved clinic — the domain nick name is permanently locked. */
export const Saved: Story = {
  args: { clinic: savedClinic },
};
