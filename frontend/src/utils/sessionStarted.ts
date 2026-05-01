// ─────────────────────────────────────────────────────────────────────────────
// Per-patient flag tracking which patients' prescription pads are
// "in progress" on this device. The backend appointment status stays
// IN_PROGRESS regardless; this localStorage flag is what the
// PrescriptionQueue uses to flip the displayed pill from "At Doc" →
// "In Progress" once the doctor clicks Start Session in the form.
//
// Keyed by patient id (UUID) — switching from appointment id earlier so
// that PrescriptionPage (which knows the patient but not the originating
// appointment) can read/write the flag.
// ─────────────────────────────────────────────────────────────────────────────

const STARTED_KEY = "docodile_prescription_started";

export function loadStartedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STARTED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persist(set: Set<string>) {
  try {
    localStorage.setItem(STARTED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function markStarted(patientId: string): Set<string> {
  const set = loadStartedSet();
  if (set.has(patientId)) return set;
  set.add(patientId);
  persist(set);
  return set;
}

export function unmarkStarted(patientId: string): Set<string> {
  const set = loadStartedSet();
  if (!set.delete(patientId)) return set;
  persist(set);
  return set;
}
