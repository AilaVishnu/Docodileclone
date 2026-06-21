import { API_BASE_URL } from "../apiConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Walk-in appointment helper. A walk-in is modelled as an implicit appointment
// for the current time so the queue / visit / billing invariants stay clean
// (V45's visit→appointment FK still holds, queue's "At Doc" tab picks it up,
// existing PrescriptionPage gates fire as if the patient was booked).
//
// Two-step under the hood:
//   1. POST /api/tenant/appointments with isWalkin=true, force=true, status
//      defaulting to BOOKED on the server (same endpoint the booking form
//      uses).
//   2. PATCH /api/tenant/appointments/{id}/status → IN_PROGRESS so the queue
//      renders the "At Doc" pill (IN_PROGRESS is the backend value; "At Doc"
//      is the display label until the doctor starts the session, after which
//      the same status shows as "In Progress" with the live timer).
// ─────────────────────────────────────────────────────────────────────────────

export type WalkinRequest = {
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  patientGender?: string | null;
  // Age in months (years × 12 + months) — matches how BookAppointment
  // persists it so existing patient rows look the same regardless of which
  // flow created them.
  patientAge?: number | null;
  // ISO yyyy-MM-dd. Optional; the booking form populates Age from DOB but
  // the walk-in modal accepts either.
  patientDob?: string | null;
  doctorId: string;
  // Defaults to "Consultation" on the server-side when omitted, but the
  // modal passes the chosen service through so the queue + bill match.
  service?: string | null;
  // Consultation fee for the booking (rupees). Null leaves the row at the
  // backend's default (0), which makes Pay Due read "No charges".
  fee?: number | null;
};

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

// LocalDateTime the backend expects — yyyy-MM-ddTHH:mm:ss in the device's
// local clock, matching what the booking form sends.
function nowLocalDateTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export type WalkinResult = {
  appointmentId: string;
  // Patient identifiers needed by setPendingSessionNav so the Rx pad can
  // auto-open for the just-booked walk-in. Backend returns them in the
  // appointment DTO.
  patientId: string;
  patientDisplayNo: number | null;
};

export async function createWalkinAppointment(req: WalkinRequest): Promise<WalkinResult> {
  if (!req.doctorId) throw new Error("No doctor selected");
  if (!req.patientName.trim()) throw new Error("Patient name is required");

  // 1. POST — backend finds-or-creates the patient, books at "now".
  //    force=true skips the same-day duplicate prompt: a walk-in can land
  //    on the same day as a pre-booked appointment.
  const bookRes = await fetch(`${API_BASE_URL}/api/tenant/appointments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      patientName: req.patientName.trim(),
      patientPhone: req.patientPhone ?? null,
      patientEmail: req.patientEmail ?? null,
      patientGender: req.patientGender ?? null,
      patientAge: req.patientAge ?? null,
      patientDob: req.patientDob ?? null,
      doctorId: req.doctorId,
      scheduledTime: nowLocalDateTime(),
      isWalkin: true,
      type: "New",
      service: req.service ?? "Consultation",
      fee: req.fee ?? null,
      force: true,
    }),
  });
  if (!bookRes.ok) {
    const body = await bookRes.json().catch(() => null);
    throw new Error((body && (body.error || body.message)) || `Booking failed (HTTP ${bookRes.status})`);
  }
  const booked = await bookRes.json() as { id: string; patientId: string; patientDisplayNo?: number | null };

  // 2. PATCH status → IN_PROGRESS (the backend's "with doctor" status; the
  //    StatusBadge displays it as "At Doc" until the session is started).
  //    Same status the queue's "Send to Doc" action sets, so the walk-in
  //    follows the existing transition convention exactly.
  const statusRes = await fetch(`${API_BASE_URL}/api/tenant/appointments/${booked.id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: "IN_PROGRESS" }),
  });
  if (!statusRes.ok) {
    // Appointment is already created at this point; surface the failure so
    // the caller can retry the status flip without re-booking.
    throw new Error(`Couldn't move to At Doc (HTTP ${statusRes.status})`);
  }
  return {
    appointmentId: booked.id,
    patientId: booked.patientId,
    patientDisplayNo: booked.patientDisplayNo ?? null,
  };
}
