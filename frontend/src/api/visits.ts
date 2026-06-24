import { API_BASE_URL } from "../apiConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Visit / Prescription REST client. Mirrors the bearer-token pattern used by
// the rest of the app (e.g. BookAppointment) — the token is read from
// localStorage on each call.
// ─────────────────────────────────────────────────────────────────────────────

export type RxRowDTO = {
  id?: string | null;
  position: number;
  medicine?: string | null;
  medicineNote?: string | null;
  dosage?: string | null;
  whenToTake?: string | null;
  frequency?: string | null;
  frequencyInterval?: string | null;
  duration?: string | null;
  notes?: string | null;
};

export type VisitDTO = {
  id: string;
  patientId: string;
  clinicId: string;
  createdByDoctorId: string | null;
  // Prescribing doctor's name, resolved server-side (robust for the print even
  // when the doctor isn't in the caller's scoped /api/doctors list).
  createdByDoctorName: string | null;
  visitDate: string; // ISO yyyy-MM-dd

  bpSystolic: string | null; bpDiastolic: string | null; bpUnit: string | null;
  bmi: string | null; bmiUnit: string | null;
  height: string | null; heightUnit: string | null;
  weight: string | null; weightUnit: string | null;
  temperature: string | null; temperatureUnit: string | null;
  pulse: string | null; pulseUnit: string | null;
  waist: string | null; waistUnit: string | null;
  hip: string | null; hipUnit: string | null;
  spo2: string | null; spo2Unit: string | null;

  familyHistory: string | null;
  allergies: string | null;
  personalHistory: string | null;
  pastMedicalHistory: string | null;

  complaints: string | null;
  diagnosis: string | null;
  notesForPatient: string | null;
  privateNotes: string | null;
  tests: string | null;

  referDoctorId: string | null;
  referDoctorName: string | null;
  reviewDate: string | null;
  reviewDays: number | null;
  reviewNotes: string | null;

  // SessionBar timing (Prescription form). All optional — only set once
  // the doctor has interacted with Start / End on the floating bar.
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
  sessionDurationSec: number | null;

  // The appointment this visit belongs to (null for legacy/imported visits).
  appointmentId: string | null;

  // The owning appointment's status (COMPLETED / IN_PROGRESS / AT_DOC / …),
  // resolved server-side. Null when the visit has no appointment. Lets the pad
  // lock/label each visit tab from its OWN completion state.
  appointmentStatus: string | null;

  prescriptions: RxRowDTO[];
};

// Same shape as VisitDTO minus server-generated fields. Used for both POST
// and PUT — full-replacement semantics on update (Rx rows wholesale-replaced).
// `createdByDoctorId` is server-set today (current user) but accepted in the
// payload too so the frontend can tag visits with the appointment's owning
// doctor when a receptionist/admin opens View Pad on the doctor's behalf.
export type SaveVisitRequest = Omit<
  VisitDTO,
  "id" | "patientId" | "clinicId" | "createdByDoctorId" | "createdByDoctorName" | "referDoctorName" | "appointmentId" | "appointmentStatus"
> & {
  createdByDoctorId?: string | null;
  appointmentId?: string | null;
};

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

const handle = async <T>(res: Response): Promise<T> => {
  if (res.ok) return res.json() as Promise<T>;
  const body = await res.json().catch(() => null);
  throw new Error((body && (body.error || body.message)) || `HTTP ${res.status}`);
};

export const listVisits = (patientId: string): Promise<VisitDTO[]> =>
  fetch(`${API_BASE_URL}/api/patients/${patientId}/visits`, { headers: authHeaders() })
    .then((r) => handle<VisitDTO[]>(r));

export const getVisit = (visitId: string): Promise<VisitDTO> =>
  fetch(`${API_BASE_URL}/api/visits/${visitId}`, { headers: authHeaders() })
    .then((r) => handle<VisitDTO>(r));

// One in-progress consultation (pad opened, not yet completed). Drives the
// live Active Sessions indicator. `sessionStartedAt` is server-owned, so the
// elapsed timer is accurate across devices/refreshes.
export type ActiveSession = {
  visitId: string;
  patientId: string;
  appointmentId: string | null;
  sessionStartedAt: string; // ISO instant
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  dob: string | null;
  age: number | null;
  displayNo: number | null;
};

export const getActiveSessions = (): Promise<ActiveSession[]> =>
  fetch(`${API_BASE_URL}/api/active-sessions`, { headers: authHeaders() })
    .then((r) => handle<ActiveSession[]>(r));

export const createVisit = (patientId: string, body: SaveVisitRequest): Promise<VisitDTO> =>
  fetch(`${API_BASE_URL}/api/patients/${patientId}/visits`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((r) => handle<VisitDTO>(r));

export const updateVisit = (visitId: string, body: SaveVisitRequest): Promise<VisitDTO> =>
  fetch(`${API_BASE_URL}/api/visits/${visitId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((r) => handle<VisitDTO>(r));

export const deleteVisit = (visitId: string): Promise<void> =>
  fetch(`${API_BASE_URL}/api/visits/${visitId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
  });
