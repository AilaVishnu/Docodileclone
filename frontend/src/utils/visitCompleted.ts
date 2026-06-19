// ─────────────────────────────────────────────────────────────────────────────
// Per-visit flag: which visits have been COMPLETED at least once on this
// device. Mirrors sessionStarted.ts. The prescription footer uses it so the
// action button reads "Complete visit" until the FIRST completion; after that
// it always reads "Save changes" (amend mode) — surviving navigation, and
// independent of the live appointment status (which flips to IN_PROGRESS the
// moment the pad opens). Keyed by visit id (UUID); localStorage so it persists.
// ─────────────────────────────────────────────────────────────────────────────

const COMPLETED_KEY = "docodile_visit_completed";

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markVisitCompleted(visitId: string): void {
  const set = load();
  if (set.has(visitId)) return;
  set.add(visitId);
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function wasVisitCompleted(visitId: string): boolean {
  return load().has(visitId);
}
