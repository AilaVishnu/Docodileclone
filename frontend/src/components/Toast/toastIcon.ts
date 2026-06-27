import { colors } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Toast icon resolver — the single source of truth for which icon (and, for the
// status toasts, which tint) each toast shows. Keyed off the MESSAGE text so the
// ~119 setToast* call sites don't each need a concept tag.
//
// Used by both the live <Toast> render points and the Storybook Toast catalog.
// If a toast message is reworded, update the matching rule here.
// Order matters: EXACT wins, then RULES are tried top-to-bottom (specific →
// generic), else the neutral default.
// ─────────────────────────────────────────────────────────────────────────────

export type ToastVisual = {
  iconName: string;
  /** For monochrome icons (the status dot) — tints via <Icon color>. */
  iconColor?: string;
  /** Pale background tint for the toast chip. */
  surfaceColor?: string;
};

const DEFAULT: ToastVisual = { iconName: "buildings" };

// Status-change toasts: a dot tinted to the queue StatusBadge (theme-independent),
// plus a pale surface of the same hue.
const STATUS: Record<string, ToastVisual> = {
  "Marked as Arrived": { iconName: "status-dot", iconColor: colors.yellow200, surfaceColor: colors.yellowAlpha10 },
  "Sent to doctor": { iconName: "status-dot", iconColor: colors.neutral700, surfaceColor: colors.alphaBlack0 },
  "Marked as Completed": { iconName: "status-dot", iconColor: colors.green200, surfaceColor: colors.greenAlpha10 },
  "Marked as No-Show": { iconName: "status-dot", iconColor: colors.neutral400, surfaceColor: colors.alphaBlack0 },
  "Appointment cancelled": { iconName: "status-dot", iconColor: colors.red100, surfaceColor: colors.redAlpha10 },
  "Visit marked complete": { iconName: "status-dot", iconColor: colors.green200, surfaceColor: colors.greenAlpha10 },
};

const SUCCESS_SEAL: ToastVisual = { iconName: "success-seal" };
const INFO_SEAL: ToastVisual = { iconName: "info-seal" };
const CALENDAR: ToastVisual = { iconName: "calendar-check" };
const ERROR: ToastVisual = { iconName: "error-circle" };
const WARNING: ToastVisual = { iconName: "warning-triangle" };
const ENVELOPE: ToastVisual = { iconName: "envelope" };
const ARCHIVE: ToastVisual = { iconName: "archive-box" };
const TRASH: ToastVisual = { iconName: "trash-bin" };
const CAPSULE: ToastVisual = { iconName: "capsule" };
const STAFF: ToastVisual = { iconName: "staff" };
const RECEIPT: ToastVisual = { iconName: "receipt" };
const RECEIPT_SLASH: ToastVisual = { iconName: "receipt-slash" };
const DOWNLOAD: ToastVisual = { iconName: "download-tray" };

const EXACT: Record<string, ToastVisual> = {
  ...STATUS,
  "Login successful": SUCCESS_SEAL,
  "Status updated": INFO_SEAL,
  "Visit moved to today": CALENDAR,
  "Appointment booked successfully": CALENDAR,
  "Appointment updated successfully": CALENDAR,
  "Visit saved": SUCCESS_SEAL,
  "Changes saved": SUCCESS_SEAL,
  "Patient info saved": SUCCESS_SEAL,
  "Migration completed successfully": SUCCESS_SEAL,
  "Patient archived": ARCHIVE,
};

const RULES: { test: RegExp; visual: ToastVisual }[] = [
  // ── disambiguations that must beat the generic error/warning buckets ──
  { test: /check your credentials/i, visual: WARNING },          // "Login failed. Please check your credentials."
  { test: /deduction failed/i, visual: ERROR },                  // bill + inventory deduction failure
  { test: /no valid rows/i, visual: ERROR },
  { test: /read the file|\.zip file|\.csv file|choose a file to import/i, visual: ERROR }, // file problems
  { test: /no print template|set one up in settings/i, visual: WARNING }, // not-set-up

  // ── billing ──
  { test: /bill waived/i, visual: RECEIPT_SLASH },
  { test: /billed via/i, visual: RECEIPT },

  // ── archive / restore ──
  { test: / is archived/i, visual: ARCHIVE },
  { test: /reactivated$/i, visual: SUCCESS_SEAL },
  { test: / restored$/i, visual: SUCCESS_SEAL },

  // ── sent (email/invite) ──
  { test: /email (sent|resent)|reset email|invite email/i, visual: ENVELOPE },

  // ── staff add ──
  { test: /added to staff$/i, visual: STAFF },

  // ── removed / deleted ──
  { test: /\bremoved\b|\bdeleted\b/i, visual: TRASH },

  // ── pharmacy ──
  { test: /stock set to/i, visual: CAPSULE },
  { test: /^saved template/i, visual: SUCCESS_SEAL },            // before the generic "Saved …"
  { test: /^saved /i, visual: CAPSULE },                         // "Saved {med}"
  { test: /^added /i, visual: CAPSULE },                         // "Added {med}"

  // ── loaded template / bulk import result ──
  { test: /^loaded "/i, visual: INFO_SEAL },
  { test: /^updated \d/i, visual: INFO_SEAL },                   // "Updated 12 · added 3 · skipped 1"

  // ── download ──
  { test: /^downloading /i, visual: DOWNLOAD },

  // ── staff "{name} updated" (after the Status/Appointment-updated exacts) ──
  { test: / updated$/i, visual: STAFF },

  // ── generic errors ──
  { test: /couldn't|failed|error occurred|went wrong|^http \d|invalid email|does not exist|network error/i, visual: ERROR },

  // ── generic warnings (validation, limits, prerequisites) ──
  { test: /^please |^enter |^maximum of|first before|nothing to print|no files to download|no phone number|add a medicine before|already exists|session has expired|at least one template|select a patient/i, visual: WARNING },
];

/** Resolve a toast message to its icon (and optional tint). */
export function resolveToastIcon(message: string): ToastVisual {
  const msg = (message || "").trim();
  if (!msg) return DEFAULT;
  if (EXACT[msg]) return EXACT[msg];
  for (const r of RULES) if (r.test.test(msg)) return r.visual;
  return DEFAULT;
}
