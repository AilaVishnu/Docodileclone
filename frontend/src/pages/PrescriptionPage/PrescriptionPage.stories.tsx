import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { PrescriptionPage } from './PrescriptionPage';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

const B = 'http://localhost:8080';

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const isoAt = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Patient + appointment the pad opens on (seeded via the pending-session-nav key).
const PATIENT_P1 = {
  id: 'p1', name: 'Ramesh Babu', phone: '+918885672664', email: null,
  gender: 'male', dob: '1986-03-12', age: 456, displayNo: 12,
  lastVisitDate: null, treatingDoctorIds: [], treatingDepartments: [],
};

const APPOINTMENTS = [
  { id: 'a1', patientId: 'p1', patientName: 'Ramesh Babu', patientPhone: '+918885672664', patientGender: 'male', patientDob: '1986-03-12', patientAge: 456, patientDisplayNo: 12, patientArchived: false, type: 'NEW', service: 'Consultation', scheduledTime: isoAt(10, 15), isWalkin: false, status: 'IN_PROGRESS', payStatus: 'DUE', doctorId: 'd1', fee: 500 },
  { id: 'a2', patientId: 'p2', patientName: 'Sita Lakshmi', patientPhone: '+919000012345', patientGender: 'female', patientDob: '1994-07-02', patientAge: 384, patientDisplayNo: 13, patientArchived: false, type: 'REVIEW', service: 'Acne Scar Treatment', scheduledTime: isoAt(10, 30), isWalkin: false, status: 'WAITING', payStatus: 'PAID', doctorId: 'd1', fee: 3500 },
];

const DOCTORS = [
  { id: 'd1', name: 'Dr. Anita Rao', department: 'Dermatology', active: true },
  { id: 'd2', name: 'Dr. Vikram Shah', department: 'General Medicine', active: true },
];

// One open visit for p1 / appointment a1 — pre-populated so the pad renders a
// realistic filled chart (vitals, complaints, diagnosis, two Rx rows).
const VISIT = {
  id: 'v1', patientId: 'p1', clinicId: 'clinic-1', createdByDoctorId: 'd1', visitDate: todayIso(),
  bpSystolic: '120', bpDiastolic: '80', bpUnit: 'mmHg',
  bmi: null, bmiUnit: null,
  height: '172', heightUnit: 'cm', weight: '70', weightUnit: 'kg',
  temperature: '98.4', temperatureUnit: '°F', pulse: '72', pulseUnit: 'bpm',
  waist: null, waistUnit: null, hip: null, hipUnit: null, spo2: '98', spo2Unit: '%',
  familyHistory: null, allergies: 'Penicillin', personalHistory: null, pastMedicalHistory: null,
  complaints: 'Itchy rash on both forearms for 5 days, worse at night.',
  diagnosis: 'Contact dermatitis', notesForPatient: 'Avoid known irritants; keep area moisturised.',
  privateNotes: null, tests: null,
  referDoctorId: null, referDoctorName: null,
  reviewDate: null, reviewDays: 7, reviewNotes: null,
  sessionStartedAt: null, sessionEndedAt: null, sessionDurationSec: null,
  appointmentId: 'a1',
  prescriptions: [
    { id: 'rx1', position: 0, medicine: 'Cetirizine 10mg', medicineNote: null, dosage: '1 tab', whenToTake: 'After food', frequency: 'OD', frequencyInterval: null, duration: '5 days', notes: null },
    { id: 'rx2', position: 1, medicine: 'Mometasone cream', medicineNote: null, dosage: 'Apply thin layer', whenToTake: null, frequency: 'BD', frequencyInterval: null, duration: '7 days', notes: 'On affected area only' },
  ],
};

const visitFor = (patientId: unknown) => ({ ...VISIT, patientId: String(patientId) });

const handlers = [
  http.get(`${B}/api/tenant/appointments`, () => HttpResponse.json(APPOINTMENTS)),
  http.get(`${B}/api/patients/:patientId/visits`, ({ params }) => HttpResponse.json([visitFor(params.patientId)])),
  http.post(`${B}/api/patients/:patientId/visits`, ({ params }) => HttpResponse.json(visitFor(params.patientId))),
  http.get(`${B}/api/visits/:visitId`, () => HttpResponse.json(VISIT)),
  http.put(`${B}/api/visits/:visitId`, () => HttpResponse.json(VISIT)),
  http.get(`${B}/api/active-sessions`, () => HttpResponse.json([])),
  http.get(`${B}/api/patients/:patientId/files`, () => HttpResponse.json([])),
  http.get(`${B}/api/tenant/rx-templates`, () => HttpResponse.json([])),
  http.get(`${B}/api/tenant/rx-history/latest`, () => HttpResponse.json({})),
  http.get(`${B}/api/medicines/search`, () => HttpResponse.json([])),
  http.get(`${B}/api/medicines/interactions`, () => HttpResponse.json([])),
  http.get(`${B}/api/doctors`, () => HttpResponse.json(DOCTORS)),
  http.get(`${B}/api/tenant/clinics/:clinicId/staff`, () => HttpResponse.json(DOCTORS)),
  http.post(`${B}/api/tenant/appointments/:id/status`, () => HttpResponse.json({})),
];

const meta = {
  title: 'Pages/Prescription/Pad',
  component: PrescriptionPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers },
    docs: {
      description: {
        component:
          'The prescription pad — the chart that opens when a patient is selected from the queue: sticky patient header, left action rail, and the form sheet (vitals grid · complaints/diagnosis · history · Rx table · reports · timeline · bills). Opened directly here by seeding the pending-session-nav for a sample patient, with all endpoints mocked via MSW.',
      },
    },
  },
  argTypes: {
    onNavigate: { control: false },
    queueRefreshKey: { control: false },
  },
  args: {
    onNavigate: () => {},
  },
} satisfies Meta<typeof PrescriptionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The pad opened on a sample patient (Ramesh Babu) with a filled visit —
 * vitals, complaints, diagnosis and two Rx rows. Seeds the pending-session-nav
 * so the page lands directly on the chart instead of the queue.
 */
export const Pad: Story = {
  decorators: [
    withClinicSession,
    withLocalStorage({
      docodile_pending_session_nav: JSON.stringify({ patient: PATIENT_P1, appointmentId: 'a1', initialAction: 0 }),
    }),
  ],
};
