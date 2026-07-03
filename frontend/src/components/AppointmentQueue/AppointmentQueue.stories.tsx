import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { AppointmentQueue } from './AppointmentQueue';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';
import { mockPharmacyStock } from '../../sb/mockData';

const B = 'http://localhost:8080';

// withClinicSession seeds docodile_clinic_id = "clinic-1"; the staff endpoint is
// keyed by that id.
const STAFF = [
  { id: 'd1', name: 'Dr. Anita Rao', role: 'DOCTOR', gender: 'female', active: true },
  { id: 'd2', name: 'Dr. Vikram Shah', role: 'DOCTOR', gender: 'male', active: true },
  { id: 'r1', name: 'Front Desk', role: 'RECEPTIONIST', gender: 'female', active: true },
];

// Build appointment rows for *today* so they land in the day the queue opens on.
const iso = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  // Backend returns a local-ish ISO without the timezone suffix; the component
  // re-parses with new Date(), so a plain ISO string is fine here.
  return d.toISOString();
};

const APPOINTMENTS = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Ramesh Babu',
    patientPhone: '+918885672664',
    patientGender: 'male',
    patientAge: 456,
    patientDisplayNo: 12,
    type: 'NEW',
    service: 'Consultation',
    scheduledTime: iso(10, 15),
    isWalkin: false,
    status: 'IN_PROGRESS',
    payStatus: 'DUE',
    doctorId: 'd1',
    fee: 500,
  },
  {
    id: 'a2',
    patientId: 'p2',
    patientName: 'Sita Lakshmi',
    patientPhone: '+919000012345',
    patientGender: 'female',
    patientAge: 384,
    patientDisplayNo: 13,
    type: 'REVIEW',
    service: 'Acne Scar Treatment',
    scheduledTime: iso(10, 30),
    isWalkin: false,
    status: 'WAITING',
    payStatus: 'PAID',
    doctorId: 'd1',
    fee: 3500,
  },
  {
    id: 'a3',
    patientId: 'p3',
    patientName: 'Arjun Mehta',
    patientPhone: '+919812345678',
    patientGender: 'male',
    patientAge: 294,
    patientDisplayNo: 14,
    type: 'NEW',
    service: 'Hydrafacial',
    scheduledTime: iso(11, 0),
    isWalkin: true,
    status: 'WAITING',
    payStatus: 'DUE',
    doctorId: 'd2',
    fee: 4000,
  },
];

// Configured weekly schedule so the child HeatmapCard derives a sensible range.
const weekday = { off: false, sessions: [{ start: '09:00', end: '18:00' }] };
const SCHEDULE = JSON.stringify({
  default: {
    mon: weekday, tue: weekday, wed: weekday, thu: weekday,
    fri: weekday, sat: weekday, sun: { off: true, sessions: [] },
  },
  overrides: {},
  configured: true,
});

const handlers = [
  http.get(`${B}/api/tenant/clinics/:clinicId/staff`, () => HttpResponse.json(STAFF)),
  http.get(`${B}/api/tenant/appointments`, () => HttpResponse.json(APPOINTMENTS)),
  http.get(`${B}/api/active-sessions`, () => HttpResponse.json([])),
  http.get(`${B}/api/tenant/pharmacy-stock`, () => HttpResponse.json(mockPharmacyStock)),
];

const meta = {
  title: 'Patterns/AppointmentQueue',
  component: AppointmentQueue,
  tags: ['autodocs'],
  decorators: [
    withClinicSession,
    withLocalStorage({ docodile_schedule: SCHEDULE }),
  ],
  parameters: {
    layout: 'fullscreen',
    // The page fetches its own data: staff (doctor tabs), appointments for the
    // selected date, active sessions (live timers) and pharmacy stock (bill
    // catalog). All mocked inline so the queue shell renders populated.
    msw: { handlers },
    docs: {
      description: {
        component:
          "The full front-desk queue page. Loads the clinic's doctors into tabs, fetches the selected day's appointments, and lays out the queue table beside the doctor-status and peak-hours cards. Owns the date picker, status-change flow, Bill Medicines and Pay-Due modals, and the Book Appointment sub-view. Endpoints are mocked via MSW so it renders with sample data.",
      },
    },
  },
  argTypes: {
    isBooking: { control: 'boolean' },
    bookingKey: { control: false },
    onBack: { control: false },
    onEditStart: { control: false },
    onViewPatientFile: { control: false },
  },
  args: {
    isBooking: false,
  },
} satisfies Meta<typeof AppointmentQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The populated queue — doctor tabs, the table and the side cards. */
export const Default: Story = {};

/** The booking sub-view, reached from the "New Appointment" action. */
export const Booking: Story = {
  args: { isBooking: true },
};

/** A clinic with no doctors yet — the "add staff" empty prompt. */
export const NoDoctors: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${B}/api/tenant/clinics/:clinicId/staff`, () => HttpResponse.json([])),
        http.get(`${B}/api/tenant/appointments`, () => HttpResponse.json([])),
        http.get(`${B}/api/active-sessions`, () => HttpResponse.json([])),
        http.get(`${B}/api/tenant/pharmacy-stock`, () => HttpResponse.json([])),
      ],
    },
  },
};
