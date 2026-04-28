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
  duration?: string | null;
  notes?: string | null;
};

export type VisitDTO = {
  id: string;
  patientId: string;
  clinicId: string;
  createdByDoctorId: string | null;
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

  prescriptions: RxRowDTO[];
};

// Same shape as VisitDTO minus server-generated fields. Used for both POST
// and PUT — full-replacement semantics on update (Rx rows wholesale-replaced).
export type SaveVisitRequest = Omit<
  VisitDTO,
  "id" | "patientId" | "clinicId" | "createdByDoctorId" | "referDoctorName"
>;

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
