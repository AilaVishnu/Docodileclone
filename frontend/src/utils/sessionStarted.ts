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

// ─────────────────────────────────────────────────────────────────────────────
// Live timer lookup — resolves the active session timer for a patient by
// scanning docodile_session_meta for a matching patient.id, then reading
// elapsed seconds from docodile_session_state. Returns null when the
// patient has no active (non-ended) session.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_META_KEY = "docodile_session_meta";
const SESSION_STATE_KEY = "docodile_session_state";

type _SessionMeta = { visitId: string; patient: { id: string } };
type _SessionState = { baseSeconds: number; runStartedAtMs: number | null; paused: boolean; ended: boolean };

export function getSessionSecondsForPatient(patientId: string): number | null {
  try {
    const metaRaw = localStorage.getItem(SESSION_META_KEY);
    const stateRaw = localStorage.getItem(SESSION_STATE_KEY);
    if (!metaRaw) return null;
    const metaMap = JSON.parse(metaRaw) as Record<string, _SessionMeta>;
    const stateMap = stateRaw ? (JSON.parse(stateRaw) as Record<string, _SessionState>) : {};
    for (const visitId of Object.keys(metaMap)) {
      const meta = metaMap[visitId];
      if (meta.patient.id !== patientId) continue;
      const state = stateMap[visitId];
      if (!state || state.ended) return null;
      return state.runStartedAtMs == null
        ? state.baseSeconds
        : state.baseSeconds + Math.max(0, Math.floor((Date.now() - state.runStartedAtMs) / 1000));
    }
    return null;
  } catch {
    return null;
  }
}
