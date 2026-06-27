import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { PrescriptionQueue } from './PrescriptionQueue';
import { withClinicSession } from '../../sb/decorators';

const B = 'http://localhost:8080';

// Appointment rows for *today* (the queue opens on today's date), shaped like
// the backend's /api/tenant/appointments response. Same endpoint the
// AppointmentQueue uses. A spread of statuses so the filter tabs + grouping are
// meaningful: At Doc / In Progress (IN_PROGRESS), Waiting, Completed.
const iso = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const APPOINTMENTS = [
  { id: 'a1', patientId: 'p1', patientName: 'Ramesh Babu', patientPhone: '+918885672664', patientGender: 'male', patientDob: '1986-03-12', patientAge: 456, patientDisplayNo: 12, patientArchived: false, type: 'NEW', service: 'Consultation', scheduledTime: iso(10, 15), isWalkin: false, status: 'IN_PROGRESS', payStatus: 'DUE', doctorId: 'd1', fee: 500 },
  { id: 'a2', patientId: 'p2', patientName: 'Sita Lakshmi', patientPhone: '+919000012345', patientGender: 'female', patientDob: '1994-07-02', patientAge: 384, patientDisplayNo: 13, patientArchived: false, type: 'REVIEW', service: 'Acne Scar Treatment', scheduledTime: iso(10, 30), isWalkin: false, status: 'WAITING', payStatus: 'PAID', doctorId: 'd1', fee: 3500 },
  { id: 'a3', patientId: 'p3', patientName: 'Arjun Mehta', patientPhone: '+919812345678', patientGender: 'male', patientDob: '2001-01-20', patientAge: 294, patientDisplayNo: 14, patientArchived: false, type: 'NEW', service: 'Hydrafacial', scheduledTime: iso(11, 0), isWalkin: true, status: 'WAITING', payStatus: 'DUE', doctorId: 'd2', fee: 4000 },
  { id: 'a4', patientId: 'p4', patientName: 'Priya Nair', patientPhone: '+919900011122', patientGender: 'female', patientDob: '1990-11-05', patientAge: 420, patientDisplayNo: 15, patientArchived: false, type: 'REVIEW', service: 'Follow-up', scheduledTime: iso(11, 30), isWalkin: false, status: 'COMPLETED', payStatus: 'PAID', doctorId: 'd1', fee: 0 },
];

const appointmentsHandler = (rows: unknown[]) =>
  http.get(`${B}/api/tenant/appointments`, () => HttpResponse.json(rows));

const meta = {
  title: 'Pages/Prescription/Queue',
  component: PrescriptionQueue,
  tags: ['autodocs'],
  decorators: [withClinicSession],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [appointmentsHandler(APPOINTMENTS)] },
    docs: {
      description: {
        component:
          "The Prescription page's landing view: today's checked-in patients as a card grid (or list), with a date picker and status-filter tabs (At Doc / Ongoing / Waiting / Completed). Clicking “View Pad” opens the prescription pad for that patient. Appointments are mocked via MSW.",
      },
    },
  },
  argTypes: {
    onSelect: { control: false },
    refreshKey: { control: false },
  },
  args: {
    onSelect: () => {},
  },
} satisfies Meta<typeof PrescriptionQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Populated queue — a spread of statuses across the filter tabs. */
export const Default: Story = {};

/** Empty day — no checked-in patients. */
export const Empty: Story = {
  parameters: { msw: { handlers: [appointmentsHandler([])] } },
};
