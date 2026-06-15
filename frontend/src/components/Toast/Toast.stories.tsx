import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Toast } from './Toast';
import { colors, fonts, spacing } from '../../styles/theme';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Transient notification toast with an icon, a message, an optional inline action button, and a close button. Auto-dismisses after `duration` ms; stories pin it open with `duration: 0`. Pass `inline` to render it in normal document flow (used by the Catalog story below).',
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
// Catalog — every toast the app can surface, grouped by area, so a designer can
// design a per-toast (or per-type) icon / illustration. Dynamic parts are shown
// with realistic example values. Enumerated from every setToast* call site.
// Keep in sync when toasts are added/removed. The coloured dot marks the
// semantic type (success / error / warning / info).
// ─────────────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

const TYPE_META: Record<ToastType, { label: string; dot: string }> = {
  success: { label: 'Success', dot: colors.green200 },
  error: { label: 'Error', dot: colors.red200 },
  warning: { label: 'Warning', dot: colors.yellow200 },
  info: { label: 'Info', dot: colors.neutral400 },
};

const CATALOG: { domain: string; items: { msg: string; type: ToastType }[] }[] = [
  {
    domain: 'Auth & Login',
    items: [
      { msg: 'Login successful', type: 'success' },
      { msg: 'Password reset email sent to ramesh@clinic.com', type: 'success' },
      { msg: 'Please enter email and password.', type: 'warning' },
      { msg: 'Please enter clinic domain.', type: 'warning' },
      { msg: 'Enter a valid email address', type: 'warning' },
      { msg: 'Enter clinic domain', type: 'warning' },
      { msg: 'Invalid email or password', type: 'error' },
      { msg: 'Email ID does not exist', type: 'error' },
      { msg: 'Login failed (HTTP 500)', type: 'error' },
      { msg: 'Login failed. Please check your credentials.', type: 'error' },
      { msg: 'Something went wrong. Please try again.', type: 'error' },
      { msg: 'Network error. Please check your connection.', type: 'error' },
      { msg: 'Network error. Please try again.', type: 'error' },
    ],
  },
  {
    domain: 'Book Appointment',
    items: [
      { msg: 'Appointment booked successfully', type: 'success' },
      { msg: 'Appointment updated successfully', type: 'success' },
      { msg: 'Consultation removed', type: 'info' },
      { msg: 'Please enter patient name', type: 'warning' },
      { msg: 'Please enter a valid email address', type: 'warning' },
      { msg: 'Please enter a valid phone number', type: 'warning' },
      { msg: 'Please enter date of birth or age', type: 'warning' },
      { msg: 'Please select a doctor', type: 'warning' },
      { msg: 'Please select at least one service', type: 'warning' },
      { msg: 'Please select a time', type: 'warning' },
      { msg: 'Please select a payment method', type: 'warning' },
      { msg: 'Failed to book appointment', type: 'error' },
      { msg: 'Failed to book appointment (500)', type: 'error' },
      { msg: 'An error occurred while booking. Check console for details.', type: 'error' },
    ],
  },
  {
    domain: 'Appointment Queue',
    items: [
      { msg: 'Marked as Arrived', type: 'success' },
      { msg: 'Sent to doctor', type: 'success' },
      { msg: 'Marked as Completed', type: 'success' },
      { msg: 'Marked as No-Show', type: 'success' },
      { msg: 'Appointment cancelled', type: 'success' },
      { msg: 'Status updated', type: 'success' },
      { msg: 'Bill waived for Ramesh Babu', type: 'success' },
      { msg: '₹500 billed via Cash for Ramesh Babu', type: 'success' },
      { msg: 'Sent to doctor · Inventory updated', type: 'success' },
      { msg: 'Sent to doctor · Short stock on: Paracetamol', type: 'warning' },
      { msg: 'Ramesh Babu is archived — restore the patient to continue.', type: 'warning' },
      { msg: 'Failed to update status', type: 'error' },
      { msg: 'Network error while updating status', type: 'error' },
      { msg: 'Pay status update failed: Network error', type: 'error' },
      { msg: 'Sent to doctor · Inventory deduction failed: Network error', type: 'error' },
      { msg: "Couldn't update payment: Network error", type: 'error' },
    ],
  },
  {
    domain: 'Memo Board',
    items: [{ msg: 'Memo deleted', type: 'info' }],
  },
  {
    domain: 'Print Template',
    items: [
      { msg: 'At least one template must exist', type: 'warning' },
      { msg: "Couldn't load templates: Network error", type: 'error' },
      { msg: "Couldn't create template: Network error", type: 'error' },
      { msg: "Couldn't delete: Network error", type: 'error' },
      { msg: "Couldn't duplicate: Network error", type: 'error' },
      { msg: "Couldn't save: Network error", type: 'error' },
    ],
  },
  {
    domain: 'Import Data',
    items: [
      { msg: 'Migration completed successfully', type: 'success' },
      { msg: 'Updated 12 · added 3 · skipped 1', type: 'success' },
      { msg: 'Please choose a .zip file.', type: 'error' },
      { msg: 'Please choose a file to import.', type: 'error' },
      { msg: 'Your login session has expired. Log out, log back in, then retry the import.', type: 'error' },
      { msg: 'No valid rows parsed.', type: 'error' },
      { msg: "Couldn't read the file.", type: 'error' },
      { msg: 'HTTP 500', type: 'error' },
    ],
  },
  {
    domain: 'Archived Patients',
    items: [
      { msg: 'Ramesh Babu restored', type: 'success' },
      { msg: "Couldn't restore: Network error", type: 'error' },
    ],
  },
  {
    domain: 'Pharmacy',
    items: [
      { msg: 'Added Amoxicillin 250mg', type: 'success' },
      { msg: 'Saved Paracetamol 500mg', type: 'success' },
      { msg: 'Removed Paracetamol 500mg', type: 'success' },
      { msg: 'Paracetamol 500mg: stock set to 120', type: 'success' },
      { msg: 'Please pick a .csv file.', type: 'error' },
      { msg: "Couldn't load inventory: Network error", type: 'error' },
      { msg: "Couldn't save: Network error", type: 'error' },
      { msg: "Couldn't update: Network error", type: 'error' },
      { msg: "Couldn't delete: Network error", type: 'error' },
      { msg: "Couldn't read the file.", type: 'error' },
    ],
  },
  {
    domain: 'Prescription Queue',
    items: [
      { msg: 'Ramesh Babu is archived — restore the patient to continue.', type: 'warning' },
    ],
  },
  {
    domain: 'Build Your Clinic',
    items: [
      { msg: 'Dr. Mehta added to staff', type: 'success' },
      { msg: 'Dr. Mehta updated', type: 'success' },
      { msg: 'Dr. Mehta reactivated', type: 'success' },
      { msg: 'Invite email resent', type: 'success' },
      { msg: 'Dr. Mehta removed — moved to Deactivated', type: 'info' },
      { msg: 'Maximum of 5 clinics reached', type: 'warning' },
      { msg: 'Maximum of 20 staff members reached', type: 'warning' },
      { msg: 'Please save the clinic details first before adding staff', type: 'warning' },
      { msg: 'Please complete all fields for "Sunrise Clinic"', type: 'warning' },
      { msg: 'A staff member with this email already exists', type: 'error' },
      { msg: "Couldn't sync clinic details", type: 'error' },
      { msg: 'Failed to remove staff member', type: 'error' },
      { msg: 'An error occurred while removing staff member', type: 'error' },
      { msg: 'Failed to reactivate staff member', type: 'error' },
      { msg: 'An error occurred while reactivating staff member', type: 'error' },
      { msg: 'Failed to save staff member (HTTP 500)', type: 'error' },
      { msg: 'An error occurred while saving staff member: Network error', type: 'error' },
      { msg: 'Failed to resend invite', type: 'error' },
      { msg: 'Failed to save "Sunrise Clinic"', type: 'error' },
      { msg: 'An error occurred while saving clinics', type: 'error' },
    ],
  },
  {
    domain: 'Prescription Pad',
    items: [
      { msg: 'Visit saved', type: 'success' },
      { msg: 'Changes saved', type: 'success' },
      { msg: 'Visit marked complete', type: 'success' },
      { msg: 'Visit moved to today', type: 'success' },
      { msg: 'Saved template "Common cold"', type: 'success' },
      { msg: 'Loaded "Common cold"', type: 'success' },
      { msg: 'Patient info saved', type: 'success' },
      { msg: 'Patient archived', type: 'success' },
      { msg: 'Downloading 3 file(s)…', type: 'info' },
      { msg: 'Enter a template name', type: 'warning' },
      { msg: 'Please enter a valid blood pressure (mmHg)', type: 'warning' },
      { msg: 'Please enter a valid weight (kg)', type: 'warning' },
      { msg: 'No files to download', type: 'warning' },
      { msg: 'Select a patient first', type: 'warning' },
      { msg: 'This patient has no phone number on file', type: 'warning' },
      { msg: 'Add a medicine before sharing', type: 'warning' },
      { msg: 'Nothing to print yet', type: 'warning' },
      { msg: 'Failed to create visit', type: 'error' },
      { msg: "Couldn't load templates", type: 'error' },
      { msg: "Couldn't save template", type: 'error' },
      { msg: "Couldn't delete template", type: 'error' },
      { msg: 'Save failed: Network error', type: 'error' },
      { msg: 'Status update failed: Network error', type: 'error' },
      { msg: 'Move failed: Network error', type: 'error' },
      { msg: 'Add visit failed: Network error', type: 'error' },
      { msg: "Couldn't load print template: Network error", type: 'error' },
      { msg: 'No print template — set one up in Settings → Print template', type: 'error' },
      { msg: "Couldn't download: Network error", type: 'error' },
    ],
  },
];

const TOTAL = CATALOG.reduce((n, s) => n + s.items.length, 0);

/**
 * Every toast the app can surface, in one page — for designing a per-toast (or
 * per-type) icon / illustration. All toasts currently render the same building
 * icon; this is the working surface to redesign that.
 */
export const Catalog: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'Every toast message the app can show, grouped by area (dynamic parts filled with example values). All currently use the same building icon — design a per-toast or per-type icon/illustration here. The coloured dot marks the semantic type.',
      },
    },
  },
  render: () => (
    <div style={{ padding: 24, maxWidth: 960, fontFamily: fonts.family.primary }}>
      <p style={{ fontSize: fonts.size.m, color: colors.neutral900, fontWeight: 600, margin: '0 0 4px' }}>
        Toast catalog · {TOTAL} messages
      </p>
      <p style={{ fontSize: fonts.size.s, color: colors.neutral700, margin: '0 0 4px', lineHeight: 1.5 }}>
        Every toast the app can surface, grouped by area. All currently render the same
        building icon — use this page to design a per-toast or per-type icon / illustration.
      </p>
      <div style={{ display: 'flex', gap: spacing.m, alignItems: 'center', margin: '0 0 28px' }}>
        {(Object.keys(TYPE_META) as ToastType[]).map((t) => (
          <span
            key={t}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: fonts.size.xs,
              color: colors.neutral500,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_META[t].dot }} />
            {TYPE_META[t].label}
          </span>
        ))}
      </div>

      {CATALOG.map((section) => (
        <section key={section.domain} style={{ marginBottom: 32 }}>
          <h3
            style={{
              fontSize: fonts.size.m,
              fontWeight: 600,
              color: colors.neutral900,
              margin: '0 0 12px',
            }}
          >
            {section.domain}{' '}
            <span style={{ color: colors.neutral400, fontWeight: 400 }}>· {section.items.length}</span>
          </h3>
          {section.items.map((t, i) => (
            <div
              key={`${section.domain}-${i}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}
            >
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
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: TYPE_META[t.type].dot,
                    flexShrink: 0,
                  }}
                />
                {TYPE_META[t.type].label}
              </span>
              <Toast inline message={t.msg} isVisible duration={0} onClose={() => {}} />
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};
