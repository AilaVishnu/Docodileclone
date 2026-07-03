import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DoctorStatusCard } from './DoctorStatusCard';

// A realistic mix: one patient at the doctor, a few waiting, a couple done.
const SAMPLE_APPOINTMENTS = [
  { status: 'IN_PROGRESS', patientName: 'Ramesh Babu', scheduledTime: '10:15 AM' },
  { status: 'WAITING', patientName: 'Sita Lakshmi', scheduledTime: '10:30 AM' },
  { status: 'WAITING', patientName: 'Arjun Mehta', scheduledTime: '10:45 AM' },
  { status: 'WAITING', patientName: 'Priya Nair', scheduledTime: '11:00 AM' },
  { status: 'COMPLETED', patientName: 'Mohan Das', scheduledTime: '09:30 AM' },
  { status: 'COMPLETED', patientName: 'Lata Iyer', scheduledTime: '09:45 AM' },
];

const meta = {
  title: 'Patterns/AppointmentQueue/DoctorStatusCard',
  component: DoctorStatusCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The cream side card next to the queue table. Summarises the active doctor's day at a glance — who's at the doctor right now, how many are waiting, an estimated wait time (15 min/head), and the completed / total counts. Derives every stat from the `appointments` array.",
      },
    },
  },
  argTypes: {
    doctorName: { control: 'text' },
    doctorGender: { control: 'inline-radio', options: ['male', 'female', 'other'] },
    doctorRole: { control: 'text' },
    appointments: { control: false },
  },
  args: {
    doctorName: 'Dr. Anita Rao',
    doctorGender: 'female',
    doctorRole: 'Doctor',
    appointments: SAMPLE_APPOINTMENTS,
  },
} satisfies Meta<typeof DoctorStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A male doctor mid-session with a busier waiting list. */
export const Busy: Story = {
  args: {
    doctorName: 'Dr. Vikram Shah',
    doctorGender: 'male',
    appointments: [
      { status: 'IN_PROGRESS', patientName: 'Arjun Mehta', scheduledTime: '11:00 AM' },
      { status: 'WAITING', patientName: 'Sita Lakshmi', scheduledTime: '11:15 AM' },
      { status: 'WAITING', patientName: 'Priya Nair', scheduledTime: '11:30 AM' },
      { status: 'WAITING', patientName: 'Mohan Das', scheduledTime: '11:45 AM' },
      { status: 'WAITING', patientName: 'Lata Iyer', scheduledTime: '12:00 PM' },
      { status: 'COMPLETED', patientName: 'Ramesh Babu', scheduledTime: '10:30 AM' },
    ],
  },
};

/** Nobody in the chair, nobody waiting — a quiet morning. */
export const Empty: Story = {
  args: {
    doctorName: 'Dr. Anita Rao',
    appointments: [],
  },
};
