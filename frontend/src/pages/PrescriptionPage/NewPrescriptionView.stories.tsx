import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { SideNav } from '../../components/SideNav';
import { TopNav } from '../../components/TopNav';
import { NewPrescriptionView } from './NewPrescriptionView';
import { withClinicSession } from '../../sb/decorators';
import { mockPatients } from '../../sb/mockData';
import { API_BASE_URL } from '../../apiConfig';
import { colors } from '../../styles/theme';

/**
 * New Prescription — the consolidated page that replaces the old pick/add
 * modals. A doctor starting a prescription for a walk-in with no appointment.
 * Reuses the New-Appointment layout + components; shown in the real app shell.
 */
const DOCTORS = [
  { id: 'd1', name: 'Dr. Anita Rao' },
  { id: 'd2', name: 'Dr. Vikram Shah' },
  { id: 'd3', name: 'Dr. Meera Krishnan' },
];
const SERVICES = [
  { id: 's1', name: 'Consultation', code: 'CONS', price: 500, durationMin: 15, discount: 0, discountMode: '%', gst: 0 },
  { id: 's2', name: 'Follow-up', code: 'FU', price: 300, durationMin: 10, discount: 0, discountMode: '%', gst: 0 },
  { id: 's3', name: 'Acne scar laser', code: 'ASL', price: 3500, durationMin: 45, discount: 0, discountMode: '%', gst: 18 },
];

const meta = {
  title: 'Pages/New Prescription',
  component: NewPrescriptionView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/doctors`, () => HttpResponse.json(DOCTORS)),
        http.get(`${API_BASE_URL}/api/patients`, () => HttpResponse.json(mockPatients)),
        http.get(`${API_BASE_URL}/api/tenant/services`, () => HttpResponse.json(SERVICES)),
      ],
    },
  },
  decorators: [withClinicSession],
} satisfies Meta<typeof NewPrescriptionView>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Page: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: colors.active.shade300 }} data-theme="primary">
      <SideNav activeTab="Prescription" onTabChange={noop} />
      <div style={{ marginLeft: 'var(--sidenav-w)', width: 'calc(100% - var(--sidenav-w))', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav onBuildClinic={noop} onViewAllClinics={noop} onLogout={noop} onNewAppointment={noop} />
          <main style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: colors.active.shade200, borderTopLeftRadius: 16, overflow: 'hidden' }}>
            <NewPrescriptionView onBack={noop} onPrescribe={noop} />
          </main>
        </div>
      </div>
    </div>
  ),
};
