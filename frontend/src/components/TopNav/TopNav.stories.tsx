import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { TopNav } from './TopNav';
import { withClinicSession } from '../../sb/decorators';

const meta = {
  title: 'Patterns/TopNav',
  component: TopNav,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The application header: the patient search on the left, the primary CTA, the message / bell / session-tray icons, and the profile avatar with its dropdown. The avatar illustration is picked from the `docodile_role` / `docodile_gender` localStorage keys (seeded by `withClinicSession`); the search reads patients from `GET /api/patients`. Normally `position: relative` inside a flex column — wrapped here in a sized stage so the absolutely-positioned dropdown has room to open.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    isBooking: { control: 'boolean', description: 'Hides the primary CTA (booking flow is already active).' },
    primaryActionLabel: { control: 'text' },
    primaryActionVariant: { control: 'inline-radio', options: ['primary', 'secondary'] },
    onBuildClinic: { control: false },
    onViewAllClinics: { control: false },
    onLogout: { control: false },
    onNewAppointment: { control: false },
    onNavigate: { control: false },
  },
  args: {
    isBooking: false,
    onBuildClinic: () => {},
    onViewAllClinics: () => {},
    onLogout: () => {},
    onNewAppointment: () => {},
  },
  decorators: [
    withClinicSession,
    (Story) => (
      <div style={{ position: 'relative', height: 120, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Prescription-page treatment: green "New Prescription" CTA. */
export const NewPrescription: Story = {
  args: {
    primaryActionLabel: 'New Prescription',
    primaryActionVariant: 'secondary',
  },
};

/** Booking flow active — the primary CTA is suppressed. */
export const Booking: Story = {
  args: { isBooking: true },
};

/** With `onNavigate` wired, the session tray button mounts (renders nothing while there are no active sessions). */
export const WithSessionTray: Story = {
  args: { onNavigate: () => {} },
};
