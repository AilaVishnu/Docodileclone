import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { Card } from '../../components/Card';
import { HintCard } from '../../components/HintCard';
import { ClinicCard } from '../../components/ClinicCard';
import { ClinicDisplayCard } from '../../components/ClinicDisplayCard';
import { DoctorStatusCard } from '../../components/AppointmentQueue/DoctorStatusCard';
import { StaffWindow } from '../../components/StaffWindow';
import type { Clinic } from '../../components/ClinicTabs';

// Consolidation view: every card surface on one page so the "paper" look and
// padding read consistently. Reuses the real components.

const noop = () => {};

const meta = {
  title: 'Overview/Cards',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleClinic: Clinic = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Sunrise Skin Clinic',
  domain: 'sunrise',
  phone: '+91 98765 43210',
  address: '12, MG Road, Bengaluru, Karnataka 560001',
  departments: ['Dermatology', 'General Medicine', 'Pediatrics'],
  staff: [],
};

const SAMPLE_APPOINTMENTS = [
  { status: 'IN_PROGRESS', patientName: 'Ramesh Babu', scheduledTime: '10:15 AM' },
  { status: 'WAITING', patientName: 'Sita Lakshmi', scheduledTime: '10:30 AM' },
  { status: 'WAITING', patientName: 'Arjun Mehta', scheduledTime: '10:45 AM' },
  { status: 'WAITING', patientName: 'Priya Nair', scheduledTime: '11:00 AM' },
  { status: 'COMPLETED', patientName: 'Mohan Das', scheduledTime: '09:30 AM' },
  { status: 'COMPLETED', patientName: 'Lata Iyer', scheduledTime: '09:45 AM' },
];

const CardDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <strong>Clinic summary</strong>
    <span style={{ color: '#6b6b6b' }}>3 doctors · 2 departments</span>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: '#fff', fontWeight: 600 }}>{children}</span>
);

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
    {children}
  </div>
);

export const All: Story = {
  render: () => (
    <Page
      title="Cards"
      intro="Every card surface together — the canonical Card paper variants, the small HintCard, the clinic cards, the queue DoctorStatusCard and the dark StaffWindow tile. Scan to keep radius, padding and shadow consistent."
    >
      <Group label="Card — paper variants (radius is always 16)">
        <Wrap>
          <Card variant="surface" padding="l" style={{ width: 240 }}>
            <CardDemo />
          </Card>
          <Card variant="sage" padding="l" style={{ width: 240 }}>
            <CardDemo />
          </Card>
          <Card variant="cream" padding="l" style={{ width: 240 }}>
            <CardDemo />
          </Card>
          <Card variant="surface" padding="l" elevation="raised" style={{ width: 240 }}>
            <CardDemo />
          </Card>
        </Wrap>
      </Group>

      <Group label="HintCard — titled hint">
        <Wrap>
          <div style={{ width: 320 }}>
            <HintCard description="Add your first doctor to begin scheduling appointments." />
          </div>
          <div style={{ width: 320 }}>
            <HintCard
              title="Next step"
              description="Invite your team so they can manage the queue with you."
            />
          </div>
        </Wrap>
      </Group>

      <Group label="ClinicCard — read-only clinic summary">
        <div style={{ width: 360 }}>
          <ClinicCard
            name="Sunrise Skin Clinic"
            domain="sunrise"
            phone="+91 98765 43210"
            address="12, MG Road, Bengaluru, Karnataka 560001"
            departments={['Dermatology', 'General Medicine']}
            onGoToDashboard={noop}
            onEditDetails={noop}
          />
        </div>
      </Group>

      <Group label="ClinicDisplayCard — clinic-selection tile">
        <div style={{ width: 360 }}>
          <ClinicDisplayCard clinic={sampleClinic} onSelect={noop} />
        </div>
      </Group>

      <Group label="DoctorStatusCard — the cream queue side card">
        <DoctorStatusCard
          doctorName="Dr. Anita Rao"
          doctorGender="female"
          doctorRole="Doctor"
          appointments={SAMPLE_APPOINTMENTS}
        />
      </Group>

      <Group label="StaffWindow — dark window tile (light stage)">
        <div
          style={{
            background: '#f4f4f2',
            padding: 24,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <StaffWindow key={i} colorIndex={i}>
              <Label>Staff {i + 1}</Label>
            </StaffWindow>
          ))}
          <StaffWindow dashed>
            <span style={{ color: '#555' }}>+ Add staff</span>
          </StaffWindow>
        </div>
      </Group>
    </Page>
  ),
};
