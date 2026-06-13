import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { BookAppointment } from './BookAppointment';
import { withClinicSession } from '../../sb/decorators';
import { mockPatients } from '../../sb/mockData';

const B = 'http://localhost:8080';

// Doctor shape is just { id, name }.
const DOCTORS = [
  { id: 'd1', name: 'Dr. Anita Rao' },
  { id: 'd2', name: 'Dr. Vikram Shah' },
  { id: 'd3', name: 'Dr. Meera Krishnan' },
];

// Clinic services catalog (ServiceDTO) — drives the Service dropdown + bill.
const SERVICES = [
  { id: 's1', name: 'Consultation', code: 'CONS', price: 500, durationMin: 15, discount: 0, discountMode: '%', gst: 0 },
  { id: 's2', name: 'Acne Scar Treatment', code: 'AST', price: 3500, durationMin: 45, discount: 0, discountMode: '%', gst: 18 },
  { id: 's3', name: 'Laser Hair Removal', code: 'LHR', price: 2500, durationMin: 30, discount: 0, discountMode: '%', gst: 18 },
  { id: 's4', name: 'Hydrafacial', code: 'HF', price: 4000, durationMin: 60, discount: 0, discountMode: '%', gst: 18 },
];

const noop = () => {};

const meta = {
  title: 'Patterns/AppointmentQueue/BookAppointment',
  component: BookAppointment,
  tags: ['autodocs'],
  decorators: [withClinicSession],
  parameters: {
    layout: 'fullscreen',
    // listServices() → /api/tenant/services and the patient autocomplete →
    // /api/patients fire on mount; the appointments endpoint only fires on
    // submit. Mock the two mount-time GETs so the form renders fully.
    msw: {
      handlers: [
        http.get(`${B}/api/tenant/services`, () => HttpResponse.json(SERVICES)),
        http.get(`${B}/api/patients`, () => HttpResponse.json(mockPatients)),
        // Same-day duplicate check on submit — return an empty day.
        http.get(`${B}/api/tenant/appointments`, () => HttpResponse.json([])),
      ],
    },
    docs: {
      description: {
        component:
          "The full Book Appointment screen — patient identity card, details form with patient autocomplete, schedule (type / date / time pickers), the appointment services list and a live bill. Takes a `doctors` array and fetches its own services catalog + patient list. Pass `editingAppointment` to render in edit mode with the fields pre-filled.",
      },
    },
  },
  argTypes: {
    doctors: { control: false },
    initialDoctorId: { control: false },
    onBack: { control: false },
    editingAppointment: { control: false },
    bookingKey: { control: false },
  },
  args: {
    doctors: DOCTORS,
    initialDoctorId: 'd1',
    onBack: noop,
  },
} satisfies Meta<typeof BookAppointment>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A fresh booking — empty form, "Book an appointment for &lt;doctor&gt;". */
export const NewBooking: Story = {};

/** Edit mode — the form pre-fills from an existing appointment. */
export const EditMode: Story = {
  args: {
    editingAppointment: {
      id: 'apt-1',
      patientName: 'Ramesh Babu',
      patientPhone: '+91 88856 72664',
      patientEmail: 'ramesh@example.com',
      patientGender: 'Male',
      patientDob: '1986-03-12',
      patientAge: 456,
      patientDisplayNo: 12,
      isWalkin: false,
      service: 'Consultation',
      type: 'New',
      scheduledTime: '2026-06-20T10:30:00',
      doctorId: 'd1',
      payStatus: 'DUE',
      paymentMethod: 'Cash',
      notes: 'Follow-up on prior course.',
      fee: 500,
    },
  },
};
