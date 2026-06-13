import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { QueueTable, Appointment } from './QueueTable';
import { withLocalStorage } from '../../sb/decorators';

// ISO helper for rawScheduledTime, on today so the no-show derivation upstream
// isn't relevant here (the table itself just renders what it's given).
const at = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const ROWS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Ramesh Babu',
    patientPhone: '+91 88856 72664',
    patientGender: 'male',
    patientAge: 456, // months → 38y
    type: 'New',
    service: 'Consultation',
    scheduledTime: '10:15 AM',
    rawScheduledTime: at(10, 15),
    isWalkin: false,
    status: 'IN_PROGRESS',
    payStatus: 'DUE',
  },
  {
    id: 'a2',
    patientId: 'p2',
    patientName: 'Sita Lakshmi',
    patientPhone: '+91 90000 12345',
    patientGender: 'female',
    patientAge: 384, // 32y
    type: 'Review',
    service: 'Acne Scar Treatment',
    scheduledTime: '10:30 AM',
    rawScheduledTime: at(10, 30),
    isWalkin: false,
    status: 'WAITING',
    payStatus: 'PAID',
  },
  {
    id: 'a3',
    patientId: 'p3',
    patientName: 'Arjun Mehta',
    patientPhone: '+91 98123 45678',
    patientGender: 'male',
    patientAge: 294, // 24y
    type: 'New',
    service: 'Laser Hair Removal',
    scheduledTime: 'Walk-in',
    rawScheduledTime: at(10, 45),
    isWalkin: true,
    status: 'WAITING',
    payStatus: 'DUE',
  },
  {
    id: 'a4',
    patientId: 'p4',
    patientName: 'Priya Nair',
    patientPhone: '+91 99888 11223',
    patientGender: 'female',
    patientAge: 540, // 45y
    type: 'Review',
    service: 'Consultation',
    scheduledTime: '09:30 AM',
    rawScheduledTime: at(9, 30),
    isWalkin: false,
    status: 'COMPLETED',
    payStatus: 'PAID',
  },
  {
    id: 'a5',
    patientId: 'p5',
    patientName: 'Mohan Das',
    patientPhone: '+91 90011 22334',
    patientGender: 'male',
    patientAge: 720, // 60y
    type: 'New',
    service: 'Hydrafacial',
    scheduledTime: '09:00 AM',
    rawScheduledTime: at(9, 0),
    isWalkin: false,
    status: 'NO_SHOW',
    payStatus: 'NO PAY',
  },
];

// Seed the T-number map the table reads from localStorage so the # column shows
// T001…T005 instead of the "T---" placeholder.
const PATIENT_MAP = JSON.stringify({ a1: 1, a2: 2, a3: 3, a4: 4, a5: 5 });

const noop = () => {};

const MENU_ITEMS = [
  { label: 'Edit Appointment', onClick: noop },
  { label: 'View Patient File', onClick: noop },
  { label: 'Bill Medicines', onClick: noop },
  {
    label: 'Mark as Paid',
    visible: (apt: Appointment) => apt.payStatus !== 'PAID',
    onClick: noop,
  },
];

// Mimics the clinic's services catalog: service name → its short code. This is
// the real path AppointmentQueue uses (it builds this map from listServices()).
const SERVICE_CODES: Record<string, string> = {
  Consultation: 'GC',
  'Acne Scar Treatment': 'AST',
  'Laser Hair Removal': 'LHR',
  Hydrafacial: 'HF',
};

const meta = {
  title: 'Patterns/AppointmentQueue/QueueTable',
  component: QueueTable,
  tags: ['autodocs'],
  decorators: [withLocalStorage({ docodile_patient_map: PATIENT_MAP })],
  parameters: {
    docs: {
      description: {
        component:
          'The front-desk queue table. One row per appointment with the T-number, patient (name + gender/age), phone, service (abbreviated), type, time / walk-in tag, a clickable status badge, a pay indicator and a three-dot action menu. Rows are visually grouped by status; passing `onStatusChange` makes the status badge a dropdown. With no rows it falls back to the ZeroQueue empty state.',
      },
    },
  },
  argTypes: {
    appointments: { control: false },
    doctorName: { control: 'text' },
    menuItems: { control: false },
    onStatusChange: { control: false },
    sessionStarts: { control: false },
    serviceCode: { control: false },
  },
  args: {
    appointments: ROWS,
    doctorName: 'Dr. Anita Rao',
    menuItems: MENU_ITEMS,
    onStatusChange: noop,
    serviceCode: (name: string) => SERVICE_CODES[name],
  },
} satisfies Meta<typeof QueueTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Read-only badges — no `onStatusChange`, so the status pill isn't a dropdown. */
export const ReadOnlyStatus: Story = {
  args: { onStatusChange: undefined },
};

/** A live consultation timer on the in-progress row via `sessionStarts`. */
export const WithLiveTimer: Story = {
  args: {
    sessionStarts: { a1: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
  },
};

/** No appointments → the ZeroQueue empty state. */
export const Empty: Story = {
  args: { appointments: [] },
};
