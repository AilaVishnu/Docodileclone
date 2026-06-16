import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Toast } from './Toast';
import { colors, fonts } from '../../styles/theme';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Transient notification toast with an icon, a message, an optional inline action button, and a close button. Auto-dismisses after `duration` ms; stories pin it open with `duration: 0`. Pass `inline` to render it in normal document flow (used by the Catalog stories below).',
      },
    },
  },
  argTypes: {
    message: { control: 'text' },
    actionLabel: { control: 'text' },
    duration: {
      control: 'number',
      table: { defaultValue: { summary: '4000' } },
    },
    inline: { control: 'boolean' },
    isVisible: { control: false },
    onClose: { control: false },
    onAction: { control: false },
  },
  args: {
    message: 'Clinic created successfully',
    isVisible: true,
    duration: 0,
    onClose: () => {},
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    message: 'Doctor removed',
    actionLabel: 'Undo',
    onAction: () => {},
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast inventory — every toast the app can surface (≈119), enumerated from all
// setToast* call sites with dynamic parts filled with example values.
//
// Two views are derived from the single ALL_TOASTS list below:
//   • Catalog   — grouped by app area (where it fires).
//   • ByConcept — grouped by visual concept (what it MEANS) → one icon per group.
//     Use this to count how many unique icons/illustrations to design.
//
// `type`    = semantic tone (success / error / warning / info) → dot colour.
// `concept` = the visual idea an icon would represent (see CONCEPTS).
// ─────────────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

const TYPE_META: Record<ToastType, { label: string; dot: string }> = {
  success: { label: 'Success', dot: colors.green200 },
  error: { label: 'Error', dot: colors.red200 },
  warning: { label: 'Warning', dot: colors.yellow200 },
  info: { label: 'Info', dot: colors.neutral400 },
};

type ConceptKey =
  | 'saved' | 'created' | 'removed' | 'restored' | 'sent' | 'status'
  | 'payment' | 'download' | 'inventory'
  | 'fillField' | 'doFirst' | 'limit' | 'archived' | 'lowStock'
  | 'failed' | 'network' | 'authFailed' | 'fileProblem' | 'sessionExpired'
  | 'duplicate' | 'notSetUp';

type ConceptGroup = 'positive' | 'needsAction' | 'error';

// Ordered: positive → needs-action → error. Each entry = ONE icon to design.
// `hint` is a starting visual metaphor — change freely.
const CONCEPTS: { key: ConceptKey; label: string; group: ConceptGroup; hint: string }[] = [
  { key: 'saved', label: 'Saved / updated', group: 'positive', hint: 'disk or check' },
  { key: 'created', label: 'Created / added', group: 'positive', hint: 'plus / sparkle' },
  { key: 'removed', label: 'Removed / deleted', group: 'positive', hint: 'trash' },
  { key: 'restored', label: 'Restored / reactivated', group: 'positive', hint: 'circular arrow' },
  { key: 'sent', label: 'Sent — email / invite', group: 'positive', hint: 'paper plane / envelope' },
  { key: 'status', label: 'Status set — appointment / visit / login', group: 'positive', hint: 'flag / check-in' },
  { key: 'payment', label: 'Payment / billing', group: 'positive', hint: 'rupee / receipt' },
  { key: 'download', label: 'Download', group: 'positive', hint: 'down-arrow tray' },
  { key: 'inventory', label: 'Inventory updated', group: 'positive', hint: 'box / pills' },
  { key: 'fillField', label: 'Fill in / fix a field', group: 'needsAction', hint: 'pencil + alert' },
  { key: 'doFirst', label: 'Do this first / nothing yet', group: 'needsAction', hint: 'hand / hourglass' },
  { key: 'limit', label: 'Limit reached', group: 'needsAction', hint: 'gauge / no-entry' },
  { key: 'archived', label: 'Archived', group: 'needsAction', hint: 'archive box' },
  { key: 'lowStock', label: 'Short stock', group: 'needsAction', hint: 'low bars / box alert' },
  { key: 'failed', label: 'Operation failed (generic)', group: 'error', hint: 'alert triangle' },
  { key: 'network', label: 'Network / connection error', group: 'error', hint: 'wifi-off' },
  { key: 'authFailed', label: 'Sign-in failed', group: 'error', hint: 'lock / key-x' },
  { key: 'fileProblem', label: 'File problem', group: 'error', hint: 'file-x' },
  { key: 'sessionExpired', label: 'Session expired', group: 'error', hint: 'clock / timeout' },
  { key: 'duplicate', label: 'Already exists', group: 'error', hint: 'duplicate copies' },
  { key: 'notSetUp', label: 'Not set up yet', group: 'error', hint: 'gear / empty' },
];

const CONCEPT_GROUP_META: Record<ConceptGroup, { label: string; color: string }> = {
  positive: { label: 'Positive / confirmations', color: colors.green200 },
  needsAction: { label: 'Needs user action', color: colors.yellow200 },
  error: { label: 'Errors / failures', color: colors.red200 },
};

const CATALOG: {
  domain: string;
  items: { msg: string; type: ToastType; concept: ConceptKey; icon?: string }[];
}[] = [
  {
    domain: 'Auth & Login',
    items: [
      { msg: 'Login successful', type: 'success', concept: 'status', icon: 'success-seal' },
      { msg: 'Password reset email sent to ramesh@clinic.com', type: 'success', concept: 'sent' },
      { msg: 'Please enter email and password.', type: 'warning', concept: 'fillField' },
      { msg: 'Please enter clinic domain.', type: 'warning', concept: 'fillField' },
      { msg: 'Enter a valid email address', type: 'warning', concept: 'fillField' },
      { msg: 'Enter clinic domain', type: 'warning', concept: 'fillField' },
      { msg: 'Invalid email or password', type: 'error', concept: 'authFailed', icon: 'error-circle' },
      { msg: 'Email ID does not exist', type: 'error', concept: 'authFailed', icon: 'error-circle' },
      { msg: 'Login failed (HTTP 500)', type: 'error', concept: 'authFailed', icon: 'error-circle' },
      { msg: 'Login failed. Please check your credentials.', type: 'error', concept: 'authFailed', icon: 'warning-triangle' },
      { msg: 'Something went wrong. Please try again.', type: 'error', concept: 'failed' },
      { msg: 'Network error. Please check your connection.', type: 'error', concept: 'network' },
      { msg: 'Network error. Please try again.', type: 'error', concept: 'network' },
    ],
  },
  {
    domain: 'Book Appointment',
    items: [
      { msg: 'Appointment booked successfully', type: 'success', concept: 'created', icon: 'calendar-check' },
      { msg: 'Appointment updated successfully', type: 'success', concept: 'saved', icon: 'calendar-check' },
      { msg: 'Consultation removed', type: 'info', concept: 'removed' },
      { msg: 'Please enter patient name', type: 'warning', concept: 'fillField' },
      { msg: 'Please enter a valid email address', type: 'warning', concept: 'fillField' },
      { msg: 'Please enter a valid phone number', type: 'warning', concept: 'fillField' },
      { msg: 'Please enter date of birth or age', type: 'warning', concept: 'fillField' },
      { msg: 'Please select a doctor', type: 'warning', concept: 'fillField' },
      { msg: 'Please select at least one service', type: 'warning', concept: 'fillField' },
      { msg: 'Please select a time', type: 'warning', concept: 'fillField' },
      { msg: 'Please select a payment method', type: 'warning', concept: 'fillField' },
      { msg: 'Failed to book appointment', type: 'error', concept: 'failed' },
      { msg: 'Failed to book appointment (500)', type: 'error', concept: 'failed' },
      { msg: 'An error occurred while booking. Check console for details.', type: 'error', concept: 'failed' },
    ],
  },
  {
    domain: 'Appointment Queue',
    items: [
      { msg: 'Marked as Arrived', type: 'success', concept: 'status' },
      { msg: 'Sent to doctor', type: 'success', concept: 'status' },
      { msg: 'Marked as Completed', type: 'success', concept: 'status' },
      { msg: 'Marked as No-Show', type: 'success', concept: 'status' },
      { msg: 'Appointment cancelled', type: 'success', concept: 'status' },
      { msg: 'Status updated', type: 'success', concept: 'status', icon: 'calendar-check' },
      { msg: 'Bill waived for Ramesh Babu', type: 'success', concept: 'payment' },
      { msg: '₹500 billed via Cash for Ramesh Babu', type: 'success', concept: 'payment', icon: 'receipt' },
      { msg: '₹500 billed via Cash for Ramesh Babu · Inventory updated', type: 'success', concept: 'inventory' },
      { msg: '₹500 billed via Cash for Ramesh Babu · Short stock on: Paracetamol (2/5)', type: 'warning', concept: 'lowStock' },
      { msg: 'Ramesh Babu is archived — restore the patient to continue.', type: 'warning', concept: 'archived' },
      { msg: 'Failed to update status', type: 'error', concept: 'failed' },
      { msg: 'Network error while updating status', type: 'error', concept: 'network' },
      { msg: 'Pay status update failed: Network error', type: 'error', concept: 'failed' },
      { msg: '₹500 billed via Cash for Ramesh Babu · Inventory deduction failed: Network error', type: 'error', concept: 'failed' },
      { msg: "Couldn't update payment: Network error", type: 'error', concept: 'failed' },
    ],
  },
  {
    domain: 'Memo Board',
    items: [{ msg: 'Memo deleted', type: 'info', concept: 'removed' }],
  },
  {
    domain: 'Print Template',
    items: [
      { msg: 'At least one template must exist', type: 'warning', concept: 'limit' },
      { msg: "Couldn't load templates: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't create template: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't delete: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't duplicate: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't save: Network error", type: 'error', concept: 'failed' },
    ],
  },
  {
    domain: 'Import Data',
    items: [
      { msg: 'Migration completed successfully', type: 'success', concept: 'created', icon: 'success-seal' },
      { msg: 'Updated 12 · added 3 · skipped 1', type: 'success', concept: 'created', icon: 'calendar-check' },
      { msg: 'Please choose a .zip file.', type: 'error', concept: 'fileProblem' },
      { msg: 'Please choose a file to import.', type: 'error', concept: 'fileProblem' },
      { msg: 'Your login session has expired. Log out, log back in, then retry the import.', type: 'error', concept: 'sessionExpired' },
      { msg: 'No valid rows parsed.', type: 'error', concept: 'fileProblem' },
      { msg: "Couldn't read the file.", type: 'error', concept: 'fileProblem' },
      { msg: 'HTTP 500', type: 'error', concept: 'failed' },
    ],
  },
  {
    domain: 'Archived Patients',
    items: [
      { msg: 'Ramesh Babu restored', type: 'success', concept: 'restored', icon: 'success-seal' },
      { msg: "Couldn't restore: Network error", type: 'error', concept: 'failed' },
    ],
  },
  {
    domain: 'Pharmacy',
    items: [
      { msg: 'Added Amoxicillin 250mg', type: 'success', concept: 'created', icon: 'capsule' },
      { msg: 'Saved Paracetamol 500mg', type: 'success', concept: 'saved', icon: 'capsule' },
      { msg: 'Removed Paracetamol 500mg', type: 'success', concept: 'removed' },
      { msg: 'Paracetamol 500mg: stock set to 120', type: 'success', concept: 'saved', icon: 'capsule' },
      { msg: 'Please pick a .csv file.', type: 'error', concept: 'fileProblem' },
      { msg: "Couldn't load inventory: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't save: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't update: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't delete: Network error", type: 'error', concept: 'failed' },
      { msg: "Couldn't read the file.", type: 'error', concept: 'fileProblem' },
    ],
  },
  {
    domain: 'Prescription Queue',
    items: [
      { msg: 'Ramesh Babu is archived — restore the patient to continue.', type: 'warning', concept: 'archived' },
    ],
  },
  {
    domain: 'Build Your Clinic',
    items: [
      { msg: 'Dr. Mehta added to staff', type: 'success', concept: 'created', icon: 'staff' },
      { msg: 'Dr. Mehta updated', type: 'success', concept: 'saved', icon: 'staff' },
      { msg: 'Dr. Mehta reactivated', type: 'success', concept: 'restored', icon: 'success-seal' },
      { msg: 'Invite email resent', type: 'success', concept: 'sent' },
      { msg: 'Dr. Mehta removed — moved to Deactivated', type: 'info', concept: 'removed' },
      { msg: 'Maximum of 5 clinics reached', type: 'warning', concept: 'limit' },
      { msg: 'Maximum of 20 staff members reached', type: 'warning', concept: 'limit' },
      { msg: 'Please save the clinic details first before adding staff', type: 'warning', concept: 'doFirst' },
      { msg: 'Please complete all fields for "Sunrise Clinic"', type: 'warning', concept: 'fillField' },
      { msg: 'A staff member with this email already exists', type: 'error', concept: 'duplicate' },
      { msg: "Couldn't sync clinic details", type: 'error', concept: 'failed' },
      { msg: 'Failed to remove staff member', type: 'error', concept: 'failed' },
      { msg: 'An error occurred while removing staff member', type: 'error', concept: 'failed' },
      { msg: 'Failed to reactivate staff member', type: 'error', concept: 'failed' },
      { msg: 'An error occurred while reactivating staff member', type: 'error', concept: 'failed' },
      { msg: 'Failed to save staff member (HTTP 500)', type: 'error', concept: 'failed' },
      { msg: 'An error occurred while saving staff member: Network error', type: 'error', concept: 'failed' },
      { msg: 'Failed to resend invite', type: 'error', concept: 'failed' },
      { msg: 'Failed to save "Sunrise Clinic"', type: 'error', concept: 'failed' },
      { msg: 'An error occurred while saving clinics', type: 'error', concept: 'failed' },
    ],
  },
  {
    domain: 'Prescription Pad',
    items: [
      { msg: 'Visit saved', type: 'success', concept: 'saved', icon: 'success-seal' },
      { msg: 'Changes saved', type: 'success', concept: 'saved', icon: 'success-seal' },
      { msg: 'Visit marked complete', type: 'success', concept: 'status' },
      { msg: 'Visit moved to today', type: 'success', concept: 'status' },
      { msg: 'Saved template "Common cold"', type: 'success', concept: 'saved', icon: 'success-seal' },
      { msg: 'Loaded "Common cold"', type: 'success', concept: 'saved' },
      { msg: 'Patient info saved', type: 'success', concept: 'saved', icon: 'success-seal' },
      { msg: 'Patient archived', type: 'success', concept: 'archived' },
      { msg: 'Downloading 3 file(s)…', type: 'info', concept: 'download' },
      { msg: 'Enter a template name', type: 'warning', concept: 'fillField' },
      { msg: 'Please enter a valid blood pressure (mmHg)', type: 'warning', concept: 'fillField' },
      { msg: 'Please enter a valid weight (kg)', type: 'warning', concept: 'fillField' },
      { msg: 'No files to download', type: 'warning', concept: 'doFirst' },
      { msg: 'Select a patient first', type: 'warning', concept: 'doFirst' },
      { msg: 'This patient has no phone number on file', type: 'warning', concept: 'doFirst' },
      { msg: 'Add a medicine before sharing', type: 'warning', concept: 'doFirst' },
      { msg: 'Nothing to print yet', type: 'warning', concept: 'doFirst' },
      { msg: 'Failed to create visit', type: 'error', concept: 'failed' },
      { msg: "Couldn't load templates", type: 'error', concept: 'failed' },
      { msg: "Couldn't save template", type: 'error', concept: 'failed' },
      { msg: "Couldn't delete template", type: 'error', concept: 'failed' },
      { msg: 'Save failed: Network error', type: 'error', concept: 'failed' },
      { msg: 'Status update failed: Network error', type: 'error', concept: 'failed' },
      { msg: 'Move failed: Network error', type: 'error', concept: 'failed' },
      { msg: 'Add visit failed: Network error', type: 'error', concept: 'failed' },
      { msg: "Couldn't load print template: Network error", type: 'error', concept: 'failed' },
      { msg: 'No print template — set one up in Settings → Print template', type: 'error', concept: 'notSetUp' },
      { msg: "Couldn't download: Network error", type: 'error', concept: 'failed' },
    ],
  },
];

const FLAT = CATALOG.flatMap((s) => s.items.map((it) => ({ ...it, area: s.domain })));
const TOTAL = FLAT.length;

// Whole-concept icon assignments: every toast in the concept uses this icon
// unless the item sets its own `icon` (a per-message `icon` always wins).
const CONCEPT_ICON: Partial<Record<ConceptKey, string>> = {
  sent: 'envelope',
  archived: 'archive-box',
  inventory: 'receipt',
  lowStock: 'receipt',
  removed: 'trash-bin',
  failed: 'error-circle',
  network: 'error-circle',
  fileProblem: 'error-circle',
  fillField: 'warning-triangle',
  doFirst: 'warning-triangle',
  limit: 'warning-triangle',
  notSetUp: 'warning-triangle',
  duplicate: 'warning-triangle',
  sessionExpired: 'warning-triangle',
};

const iconFor = (t: { concept: ConceptKey; icon?: string }): string | undefined =>
  t.icon ?? CONCEPT_ICON[t.concept];

// ── shared bits ──────────────────────────────────────────────────────────────

function TypeTag({ type }: { type: ToastType }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        width: 78,
        flexShrink: 0,
        fontSize: fonts.size.xs,
        color: colors.neutral500,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_META[type].dot, flexShrink: 0 }} />
      {TYPE_META[type].label}
    </span>
  );
}

function ToastRow({ msg, type, icon, trailing }: { msg: string; type: ToastType; icon?: string; trailing?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <TypeTag type={type} />
      <Toast inline message={msg} iconName={icon} isVisible duration={0} onClose={() => {}} />
      {trailing && <span style={{ fontSize: fonts.size.xs, color: colors.neutral400 }}>{trailing}</span>}
    </div>
  );
}

const pageWrap = { padding: 24, maxWidth: 1000, fontFamily: fonts.family.primary };

// ── Story 1: grouped by app area ─────────────────────────────────────────────

/** Every toast the app can surface, grouped by the area where it fires. */
export const Catalog: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'Every toast message the app can show, grouped by app area (dynamic parts filled with example values). All currently use the same building icon. The coloured dot marks the semantic type.',
      },
    },
  },
  render: () => (
    <div style={pageWrap}>
      <p style={{ fontSize: fonts.size.m, color: colors.neutral900, fontWeight: 600, margin: '0 0 4px' }}>
        Toast inventory · {TOTAL} messages
      </p>
      <p style={{ fontSize: fonts.size.s, color: colors.neutral700, margin: '0 0 24px', lineHeight: 1.5 }}>
        Grouped by app area. For the icon count, see the <strong>By concept</strong> story.
      </p>
      {CATALOG.map((section) => (
        <section key={section.domain} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900, margin: '0 0 12px' }}>
            {section.domain} <span style={{ color: colors.neutral400, fontWeight: 400 }}>· {section.items.length}</span>
          </h3>
          {section.items.map((t, i) => (
            <ToastRow key={`${section.domain}-${i}`} msg={t.msg} type={t.type} icon={iconFor(t)} />
          ))}
        </section>
      ))}
    </div>
  ),
};

// ── Story 2: grouped by visual concept → one icon per group ───────────────────

/**
 * The same toasts re-grouped by what they MEAN. Each group = one icon to design,
 * so the number of groups is the number of unique icons/illustrations needed.
 */
export const ByConcept: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'The same toasts re-grouped by visual concept (Saving, Deleting, Network error, …). Each group is one icon to design — the section count at the top is how many unique icons/illustrations you need. The dashed square is the icon slot. Hint text is a starting metaphor; merge or split groups freely.',
      },
    },
  },
  render: () => {
    let lastGroup: ConceptGroup | null = null;
    return (
      <div style={pageWrap}>
        <p style={{ fontSize: fonts.size.m, color: colors.neutral900, fontWeight: 600, margin: '0 0 4px' }}>
          {CONCEPTS.length} unique icons · {TOTAL} toasts
        </p>
        <p style={{ fontSize: fonts.size.s, color: colors.neutral700, margin: '0 0 28px', lineHeight: 1.5 }}>
          One icon per group below. The dashed square is the icon slot; the hint is a starting metaphor.
          Several groups have only one or two toasts — merge them if you'd rather design fewer.
        </p>

        {CONCEPTS.map((c) => {
          const items = FLAT.filter((t) => t.concept === c.key);
          if (items.length === 0) return null;
          const groupChanged = c.group !== lastGroup;
          lastGroup = c.group;
          const gmeta = CONCEPT_GROUP_META[c.group];
          return (
            <div key={c.key}>
              {groupChanged && (
                <h2
                  style={{
                    fontSize: fonts.size.s,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: gmeta.color,
                    fontWeight: 700,
                    margin: '28px 0 14px',
                  }}
                >
                  {gmeta.label}
                </h2>
              )}
              <section style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: `1.5px dashed ${colors.neutral300}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      color: colors.neutral400,
                      flexShrink: 0,
                    }}
                  >
                    icon
                  </div>
                  <div>
                    <div style={{ fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900 }}>
                      {c.label}{' '}
                      <span style={{ color: colors.neutral400, fontWeight: 400 }}>· {items.length}</span>
                    </div>
                    <div style={{ fontSize: fonts.size.xs, color: colors.neutral500 }}>
                      suggested: {c.hint}
                    </div>
                  </div>
                </div>
                <div style={{ paddingLeft: 56 }}>
                  {items.map((t, i) => (
                    <ToastRow key={`${c.key}-${i}`} msg={t.msg} type={t.type} icon={iconFor(t)} trailing={t.area} />
                  ))}
                </div>
              </section>
            </div>
          );
        })}
      </div>
    );
  },
};
