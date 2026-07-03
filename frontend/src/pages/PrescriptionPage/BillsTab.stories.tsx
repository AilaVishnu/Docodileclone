import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React, { CSSProperties } from "react";
import { DataGrid, GridColumn } from "../../components/DataGrid/DataGrid";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import type { Bill } from "../../api/bills";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

/**
 * SCRATCH / exploration — NOT wired into the app. A proposal for the patient
 * file's "Bills" tab (currently a "coming soon" placeholder). Reuses the real
 * `Bill` model (api/bills), the RecentBills table pattern, the ₹ helpers, and
 * the status-tint tokens. Idea: an in-page account view = a money summary +
 * the patient's invoice history (vs. RecentBills, which is a modal).
 */

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const ORD = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d}${ORD(d)} ${MONTHS[m - 1]} ${y}` : iso;
};

type BillRow = Bill & { summary: string };

const bill = (p: Partial<BillRow>): BillRow => ({
  id: p.invoiceNo!, invoiceNo: "", billDate: "", billed: 0, paid: 0, due: 0, refund: 0,
  depositApplied: null, payStatus: null, paymentMethod: null, items: null,
  appointmentId: null, createdAt: "", summary: "", ...p,
});

const BILLS: BillRow[] = [
  bill({ invoiceNo: "INV-2026-0042", billDate: "2026-06-23", billed: 1850, paid: 1850, due: 0, paymentMethod: "UPI", summary: "Consultation · 2 medicines" }),
  bill({ invoiceNo: "INV-2026-0038", billDate: "2026-06-09", billed: 3200, paid: 1500, due: 1700, paymentMethod: "Card", summary: "Consultation · Minor procedure" }),
  bill({ invoiceNo: "INV-2026-0031", billDate: "2026-05-23", billed: 600, paid: 0, due: 600, summary: "Consultation" }),
  bill({ invoiceNo: "INV-2026-0025", billDate: "2026-05-05", billed: 2400, paid: 2400, due: 0, refund: 400, paymentMethod: "Cash", summary: "Lab tests · 1 medicine" }),
  bill({ invoiceNo: "INV-2026-0019", billDate: "2026-04-18", billed: 500, paid: 0, due: 0, payStatus: "WAIVED", paymentMethod: "Waive", summary: "Follow-up (waived)" }),
];

type Status = "paid" | "partial" | "unpaid" | "refunded" | "waived";
const statusOf = (b: BillRow): Status =>
  b.payStatus === "WAIVED" ? "waived"
  : b.refund > 0 ? "refunded"
  : b.due <= 0 && b.paid > 0 ? "paid"
  : b.paid > 0 && b.due > 0 ? "partial"
  : "unpaid";

const STATUS_STYLE: Record<Status, { bg: string; fg: string; label: string }> = {
  paid: { bg: colors.greenAlpha20, fg: colors.green200, label: "Paid" },
  partial: { bg: colors.yellowAlpha20, fg: colors.yellow300, label: "Partial" },
  unpaid: { bg: colors.redAlpha20, fg: colors.red200, label: "Unpaid" },
  refunded: { bg: colors.neutral150, fg: colors.neutral600, label: "Refunded" },
  waived: { bg: colors.neutral150, fg: colors.neutral600, label: "Waived" },
};

const StatusChip = ({ kind }: { kind: Status }) => {
  const s = STATUS_STYLE[kind];
  return <span style={{ ...st.chip, backgroundColor: s.bg, color: s.fg }}>{s.label}</span>;
};

// One summary figure (Outstanding / Billed / Paid / Advance).
const Tile = ({ label, value, accent }: { label: string; value: string; accent?: "due" | "clear" }) => (
  <div
    style={{
      ...st.tile,
      ...(accent === "due" ? { backgroundColor: colors.redAlpha20, borderColor: "transparent" } : {}),
      ...(accent === "clear" ? { backgroundColor: colors.greenAlpha20, borderColor: "transparent" } : {}),
    }}
  >
    <span style={st.tileLabel}>{label}</span>
    <span style={{ ...st.tileValue, ...(accent === "due" ? { color: colors.red200 } : {}), ...(accent === "clear" ? { color: colors.green200 } : {}) }}>{value}</span>
  </div>
);

function BillsTab({ bills }: { bills: BillRow[] }) {
  const totalBilled = bills.reduce((s, b) => s + b.billed, 0);
  const totalPaid = bills.reduce((s, b) => s + b.paid, 0);
  const outstanding = bills.reduce((s, b) => s + b.due, 0);
  const advance = 1000; // mock credit on account

  const columns: GridColumn<BillRow>[] = [
    { key: "no", header: "#", width: 48, align: "left", render: (_b, i) => <span style={st.muted}>{i + 1}</span> },
    {
      key: "inv", header: "BILL NO & DATE", align: "left", render: (b) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button type="button" style={st.invLink}>{b.invoiceNo}</button>
          <span style={st.muted}>{fmtDate(b.billDate)}</span>
        </div>
      ),
    },
    { key: "items", header: "ITEMS", align: "left", render: (b) => <span style={st.items}>{b.summary}</span> },
    { key: "billed", header: "BILLED", align: "left", render: (b) => inr(b.billed) },
    { key: "paid", header: "PAID", align: "left", render: (b) => inr(b.paid) },
    { key: "due", header: "DUE", align: "left", render: (b) => (b.due > 0 ? <span style={{ color: colors.red200, fontWeight: fonts.weight.medium }}>{inr(b.due)}</span> : <span style={st.muted}>–</span>) },
    { key: "status", header: "STATUS", width: 110, align: "left", render: (b) => <StatusChip kind={statusOf(b)} /> },
    {
      key: "action", header: "", width: 92, align: "right", render: () => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs }}>
          <IconButton ariaLabel="Print bill" color={colors.neutral700}><Icon name="printer" size={18} tone="inherit" /></IconButton>
          <IconButton ariaLabel="View bill" color={colors.neutral700}><Icon name="edit-pencil" size={18} tone="inherit" /></IconButton>
        </div>
      ),
    },
  ];

  return (
    <div style={st.page}>
      {/* Header: title + primary actions */}
      <div style={st.headerRow}>
        <span style={st.h1}>Billing</span>
        <div style={{ display: "flex", gap: spacing.s }}>
          <Button variant="light" size="md" disabled={outstanding === 0} iconLeft={<Icon name="bill-check" size={18} tone="inherit" />}>Record payment</Button>
          <Button variant="dark" size="md" iconLeft={<Icon name="plus" size={18} tone="inverse" />}>New bill</Button>
        </div>
      </div>

      {/* Account summary */}
      <div style={st.tiles}>
        <Tile label="Outstanding due" value={inr(outstanding)} accent={outstanding > 0 ? "due" : "clear"} />
        <Tile label="Total billed" value={inr(totalBilled)} />
        <Tile label="Total paid" value={inr(totalPaid)} />
        <Tile label="Advance on account" value={inr(advance)} />
      </div>

      {/* Bills history */}
      <div style={st.tableCard}>
        <div style={st.tableHead}>
          <span style={st.tableTitle}>Bills</span>
          <span style={st.muted}>{bills.length} total</span>
        </div>
        {bills.length === 0 ? (
          <div style={st.empty}>
            <Icon name="bill-check" size={40} tone="inherit" style={{ color: colors.neutral300 }} />
            <span style={st.emptyTitle}>No bills yet</span>
            <span style={st.muted}>Create the patient's first bill to start their billing record.</span>
            <div style={{ marginTop: spacing.s }}>
              <Button variant="dark" size="md" iconLeft={<Icon name="plus" size={18} tone="inverse" />}>Create first bill</Button>
            </div>
          </div>
        ) : (
          <DataGrid columns={columns} rows={bills} rowKey={(b) => b.id} size="m" tdPadding="14px 12px" thPadding="10px 12px" />
        )}
      </div>
    </div>
  );
}

const st: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: spacing.l, fontFamily: fonts.family.primary },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.m },
  h1: { fontSize: fonts.size.l, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  tiles: { display: "flex", gap: spacing.m },
  tile: { flex: 1, display: "flex", flexDirection: "column", gap: spacing["2xs"], padding: spacing.l, borderRadius: radii.l, backgroundColor: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral200}` },
  tileLabel: { fontSize: fonts.size.xs, fontWeight: fonts.weight.medium, letterSpacing: "0.03em", textTransform: "uppercase", color: colors.neutral500 },
  tileValue: { fontSize: fonts.size.l, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  tableCard: { backgroundColor: colors.neutral100, borderRadius: radii.l, border: `${strokes.xs} solid ${colors.neutral200}`, overflow: "hidden" },
  tableHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: `${spacing.m} ${spacing.l}`, borderBottom: `${strokes.xs} solid ${colors.neutral200}` },
  tableTitle: { fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  muted: { color: colors.neutral500, fontSize: fonts.size.s },
  items: { color: colors.neutral700, fontSize: fonts.size.s },
  invLink: { border: "none", background: "transparent", padding: 0, cursor: "pointer", color: colors.active.shade700, fontFamily: fonts.family.primary, fontSize: fonts.size.m, fontWeight: fonts.weight.medium, textAlign: "left" },
  chip: { display: "inline-flex", alignItems: "center", padding: `2px ${spacing.xs}`, borderRadius: radii.full, fontSize: fonts.size.xs, fontWeight: fonts.weight.medium, whiteSpace: "nowrap" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs, padding: "56px 16px", textAlign: "center" },
  emptyTitle: { fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
};

// ── v2 — on the white form sheet (like the page's other sections), one hero +
// caption instead of 4 tiles, Unpaid/Paid filters, whole-row click. ──────────
function BillsTabV2({ bills }: { bills: BillRow[] }) {
  const [filter, setFilter] = React.useState<"all" | "unpaid" | "paid">("all");
  const totalBilled = bills.reduce((s, b) => s + b.billed, 0);
  const totalPaid = bills.reduce((s, b) => s + b.paid, 0);
  const outstanding = bills.reduce((s, b) => s + b.due, 0);
  const advance = 1000;
  const due = outstanding > 0;
  const shown = bills.filter((b) => (filter === "all" ? true : filter === "unpaid" ? b.due > 0 : b.due <= 0));

  const columns: GridColumn<BillRow>[] = [
    { key: "no", header: "#", width: 44, align: "left", render: (_b, i) => <span style={st.muted}>{i + 1}</span> },
    {
      key: "inv", header: "BILL NO & DATE", align: "left", render: (b) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={st2.invText}>{b.invoiceNo}</span>
          <span style={st.muted}>{fmtDate(b.billDate)}</span>
        </div>
      ),
    },
    { key: "items", header: "ITEMS", align: "left", render: (b) => <span style={st.items}>{b.summary}</span> },
    { key: "billed", header: "BILLED", align: "left", render: (b) => inr(b.billed) },
    { key: "paid", header: "PAID", align: "left", render: (b) => inr(b.paid) },
    { key: "due", header: "DUE", align: "left", render: (b) => (b.due > 0 ? <span style={{ color: colors.red200, fontWeight: fonts.weight.medium }}>{inr(b.due)}</span> : <span style={st.muted}>–</span>) },
    { key: "status", header: "STATUS", width: 108, align: "left", render: (b) => <StatusChip kind={statusOf(b)} /> },
    { key: "go", header: "", width: 32, align: "right", render: () => <Icon name="chevron-right" size={18} tone="inherit" style={{ color: colors.neutral400 }} /> },
  ];

  return (
    <div style={st2.sheet}>
      {/* Summary: one hero (outstanding) + a quiet secondary stat + actions */}
      <div style={st2.summary}>
        <div style={st2.summaryLeft}>
          <div style={{ ...st2.hero, backgroundColor: due ? colors.redAlpha20 : colors.greenAlpha20 }}>
            <span style={{ ...st2.heroLabel, color: due ? colors.red200 : colors.green200 }}>Outstanding due</span>
            <span style={{ ...st2.heroValue, color: due ? colors.red200 : colors.green200 }}>{inr(outstanding)}</span>
            <span style={st2.heroCaption}>{inr(totalPaid)} paid of {inr(totalBilled)} billed</span>
          </div>
          {advance > 0 && (
            <div style={st2.stat}>
              <span style={st2.statLabel}>Advance on account</span>
              <span style={st2.statValue}>{inr(advance)}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing.s }}>
          <Button variant="light" size="md" disabled={!due} iconLeft={<Icon name="bill-check" size={18} tone="inherit" />}>Record payment</Button>
          <Button variant="dark" size="md" iconLeft={<Icon name="plus" size={18} tone="inverse" />}>New bill</Button>
        </div>
      </div>

      {/* Bills section — header + filter pills + clickable rows */}
      <div style={st2.section}>
        <div style={st2.sectionHead}>
          <div style={st2.titleWrap}>
            <Icon name="bill-check" size={22} tone="inherit" style={{ color: colors.neutral900 }} />
            <span style={st2.sectionTitle}>Bills</span>
          </div>
          {bills.length > 0 && (
            <div style={st2.filters}>
              {(["all", "unpaid", "paid"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)} style={{ ...st2.pill, ...(filter === f ? st2.pillActive : {}) }}>
                  {f === "all" ? "All" : f === "unpaid" ? "Unpaid" : "Paid"}
                </button>
              ))}
            </div>
          )}
        </div>
        {bills.length === 0 ? (
          <div style={st.empty}>
            <Icon name="bill-check" size={40} tone="inherit" style={{ color: colors.neutral300 }} />
            <span style={st.emptyTitle}>No bills yet</span>
            <span style={st.muted}>Create the patient's first bill to start their billing record.</span>
            <div style={{ marginTop: spacing.s }}>
              <Button variant="dark" size="md" iconLeft={<Icon name="plus" size={18} tone="inverse" />}>Create first bill</Button>
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div style={st2.empty2}>No {filter} bills.</div>
        ) : (
          <DataGrid columns={columns} rows={shown} rowKey={(b) => b.id} size="m" tdPadding="14px 10px" thPadding="8px 10px" onRowClick={() => {}} rowStyle={() => ({ cursor: "pointer" })} />
        )}
      </div>
    </div>
  );
}

const st2: Record<string, CSSProperties> = {
  // The white form sheet (mirrors PrescriptionPage rightColumn).
  sheet: { backgroundColor: colors.neutral100, borderRadius: radii.xl, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.l, fontFamily: fonts.family.primary },
  summary: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.m, paddingBottom: spacing.l, borderBottom: `${strokes.xs} solid ${colors.primary300}` },
  summaryLeft: { display: "flex", alignItems: "stretch", gap: spacing.l },
  hero: { display: "flex", flexDirection: "column", gap: spacing["3xs"], padding: `${spacing.s} ${spacing.l}`, borderRadius: radii.l },
  heroLabel: { fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, letterSpacing: "0.03em", textTransform: "uppercase" },
  heroValue: { fontSize: fonts.size.l, fontWeight: fonts.weight.semibold },
  heroCaption: { fontSize: fonts.size.s, color: colors.neutral600 },
  stat: { display: "flex", flexDirection: "column", gap: spacing["3xs"], justifyContent: "center" },
  statLabel: { fontSize: fonts.size.xs, fontWeight: fonts.weight.medium, letterSpacing: "0.03em", textTransform: "uppercase", color: colors.neutral500 },
  statValue: { fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  section: { display: "flex", flexDirection: "column", gap: spacing.s },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  titleWrap: { display: "flex", alignItems: "center", gap: spacing.xs },
  sectionTitle: { fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  filters: { display: "flex", gap: spacing["3xs"] },
  pill: { padding: `4px ${spacing.s}`, borderRadius: radii.full, fontSize: fonts.size.xs, fontWeight: fonts.weight.medium, cursor: "pointer", border: "none", backgroundColor: colors.alphaBlack0, color: colors.neutral600, fontFamily: fonts.family.primary },
  pillActive: { backgroundColor: colors.neutral900, color: colors.neutral100 },
  invText: { fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 },
  empty2: { padding: "40px 8px", textAlign: "center", color: colors.neutral500, fontSize: fonts.size.s },
};

// Cream page background (the app shell) so white cards read correctly.
const onCream = (Story: React.ComponentType) => (
  <div style={{ backgroundColor: colors.active.shade200, padding: spacing.xl, minHeight: "100vh" }}>
    <div style={{ maxWidth: 1000 }}><Story /></div>
  </div>
);

const meta = {
  title: "Pages/Prescription/Bills (exploration)",
  decorators: [onCream],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The proposed Bills tab: money summary + invoice history with status chips. */
export const Default: Story = { render: () => <BillsTab bills={BILLS} /> };

/** First-time state — no bills yet. */
export const Empty: Story = { render: () => <BillsTab bills={[]} /> };

/** Everything settled — outstanding tile reads green. */
export const AllSettled: Story = {
  render: () => <BillsTab bills={BILLS.filter((b) => b.due === 0)} />,
};

// ── v2 (refined) — on the white sheet, one hero + caption, filters, row click ─
/** v2: refined direction for comparison. */
export const RefinedV2: Story = { render: () => <BillsTabV2 bills={BILLS} /> };

/** v2 empty state. */
export const RefinedV2Empty: Story = { render: () => <BillsTabV2 bills={[]} /> };
