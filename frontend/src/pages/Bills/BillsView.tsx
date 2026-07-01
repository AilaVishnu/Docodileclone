import React from "react";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { Card } from "../../components/Card";
import { Tabs } from "../../components/Tabs";
import { DateRangeDropdown } from "../../components/DateRangeDropdown/DateRangeDropdown";
import { DataGrid, GridColumn } from "../../components/DataGrid/DataGrid";
import { SearchField } from "../../components/SearchField";
import { BillStatusBadge, billStatusOf } from "../../components/BillStatusBadge";
import { BillModal } from "../../components/BillCard/BillModal";
import { BillReadModal, parseLines } from "./BillReadModal";
import { printBill } from "./printBill";
import { listClinicBills, payBill, type Bill } from "../../api/bills";
import { Toast } from "../../components/Toast";
import { resolveToastIcon } from "../../components/Toast/toastIcon";
import { colors, spacing } from "../../styles/theme";
import { styles } from "./BillsView.styles";

// Period preset → ISO yyyy-mm-dd {from,to} for the clinic-bills fetch.
const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function rangeFor(period: string, customStart: string, customEnd: string): { from?: string; to?: string } {
  const today = new Date();
  const minus = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
  switch (period) {
    case "today": return { from: isoDay(today), to: isoDay(today) };
    case "yesterday": return { from: isoDay(minus(1)), to: isoDay(minus(1)) };
    case "last7": return { from: isoDay(minus(6)), to: isoDay(today) };
    case "last30": return { from: isoDay(minus(29)), to: isoDay(today) };
    case "thisMonth": return { from: isoDay(new Date(today.getFullYear(), today.getMonth(), 1)), to: isoDay(today) };
    case "custom": return { from: customStart || undefined, to: customEnd || undefined };
    default: return {};
  }
}

/** A bill plus the patient it belongs to (the clinic-wide list joins these). */
export type ClinicBill = Bill & { patientName: string; today?: boolean };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const ORD = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d}${ORD(d)} ${MONTHS[m - 1]} ${y}` : iso;
};

const Kpi =({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <Card variant="surface" elevation="none" padding="l" style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing["2xs"] }}>
    <span style={styles.kpiLabel}>{label}</span>
    <span style={{ ...styles.kpiValue, ...(tone ? { color: tone } : {}) }}>{value}</span>
  </Card>
);

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "due", label: "Due" },
  { id: "refunded", label: "Refunded" },
  { id: "waived", label: "Waived" },
];
// Same preset set as the Stats page; "custom" opens the in-place range calendar.
const PERIODS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "custom", label: "Custom range" },
];

// The "Billed …" KPI mirrors the header range: presets → "Billed today" /
// "Billed this month"; a custom range → "Billed 18 Jun – 20 Jun" (the same text
// the header dropdown shows). The value is already period-scoped (the page
// fetches per range), so only the label tracks the selection.
const dayMon = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return m && d ? `${d} ${MONTHS[m - 1]}` : iso;
};
function billedLabel(period: string, customStart: string, customEnd: string): string {
  if (period === "custom") {
    return customStart && customEnd ? `Billed ${dayMon(customStart)} – ${dayMon(customEnd)}` : "Billed custom range";
  }
  const preset = PERIODS.find((p) => p.id === period);
  return `Billed ${(preset?.label ?? "this month").toLowerCase()}`;
}

export interface BillsViewProps {
  /** Clinic-wide bills (joined with patient name). Omit to let the page fetch
   *  them itself from the period filter (stories pass a static set). */
  bills?: ClinicBill[];
  loading?: boolean;
  onOpenBill?: (bill: ClinicBill) => void;
  onPrintBill?: (bill: ClinicBill) => void;
  onExport?: () => void;
}

/**
 * Clinic-wide Bills page (the sidebar "Billing" module). PageHeader → KPI strip
 * → search + status/period filters → invoice table. Composed from existing
 * components (Card, Tabs, DateRangeDropdown, DataGrid, PageHeader, Button).
 */
export function BillsView({ bills: billsProp, loading: loadingProp, onOpenBill, onPrintBill, onExport }: BillsViewProps) {
  const [status, setStatus] = React.useState("all");
  const [period, setPeriod] = React.useState("thisMonth");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");
  const [query, setQuery] = React.useState("");

  // Self-fetch the clinic bills for the selected period unless a static set was
  // passed in (stories). Re-fetches whenever the period / custom range changes.
  const [fetched, setFetched] = React.useState<ClinicBill[]>([]);
  const [fetching, setFetching] = React.useState(false);
  React.useEffect(() => {
    if (billsProp) return;
    const { from, to } = rangeFor(period, customStart, customEnd);
    if (period === "custom" && (!from || !to)) return; // wait for both ends
    let cancelled = false;
    setFetching(true);
    listClinicBills(from, to)
      .then((b) => { if (!cancelled) setFetched(b); })
      .catch(() => { if (!cancelled) setFetched([]); })
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [billsProp, period, customStart, customEnd]);

  const bills = billsProp ?? fetched;
  const loading = loadingProp ?? fetching;
  // Row-click / "View bill" opens the bill: an unpaid draft → the editable
  // BillModal (seeded); anything settled → the read-only BillReadModal.
  const [openBill, setOpenBill] = React.useState<ClinicBill | null>(null);
  const [toastMessage, setToastMessage] = React.useState("");
  const openBillModal = (b: ClinicBill) => { setOpenBill(b); onOpenBill?.(b); };

  // Record a payment against a bill (Mark paid / Pay ₹X / Record payment), then
  // refresh the row in place and close. Surfaces the failure as a toast (and
  // keeps the modal open) so the desk isn't left guessing.
  const recordPayment = async (b: ClinicBill, amount: number, method: string) => {
    if (amount <= 0) return;
    try {
      const updated = await payBill(b.id, { paidAmount: amount, method });
      setFetched((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      setOpenBill(null);
    } catch (e) {
      setToastMessage((e as Error).message || "Couldn't record the payment");
    }
  };

  const collectedToday = bills.filter((b) => b.today).reduce((s, b) => s + b.paid, 0);
  const outstanding = bills.reduce((s, b) => s + b.due, 0);
  const billedInRange = bills.reduce((s, b) => s + b.billed, 0);
  const billsToday = bills.filter((b) => b.today).length;

  const q = query.trim().toLowerCase();
  const shown = bills.filter((b) => {
    const statusOk = status === "all" || billStatusOf(b) === status;
    const queryOk = !q || b.patientName.toLowerCase().includes(q) || b.invoiceNo.toLowerCase().includes(q);
    return statusOk && queryOk;
  });

  const columns: GridColumn<ClinicBill>[] = [
    { key: "sno", header: "S.NO", width: 64, align: "left", render: (_b, i) => <span style={styles.muted}>{String(i + 1).padStart(2, "0")}</span> },
    { key: "patient", header: "Patient", align: "left", render: (b) => b.patientName, sortAccessor: (b) => b.patientName },
    {
      key: "inv", header: "Invoice & date", align: "left", render: (b) => (
        <div style={styles.invCell}>
          <span>{b.invoiceNo}</span>
          <span style={styles.muted}>{fmtDate(b.billDate)}</span>
        </div>
      ),
      sortAccessor: (b) => b.billDate,
    },
    { key: "billed", header: "Billed", align: "right", render: (b) => inr(b.billed), sortAccessor: (b) => b.billed },
    { key: "paid", header: "Paid", align: "right", render: (b) => inr(b.paid), sortAccessor: (b) => b.paid },
    { key: "due", header: "Due", align: "right", render: (b) => (b.due > 0 ? <span style={styles.due}>{inr(b.due)}</span> : <span style={styles.muted}>–</span>), sortAccessor: (b) => b.due },
    { key: "status", header: "Status", width: 132, align: "left", render: (b) => <BillStatusBadge status={billStatusOf(b)} />, sortAccessor: (b) => billStatusOf(b) },
    { key: "method", header: "Method", width: 96, align: "left", render: (b) => b.paymentMethod ?? "–", sortAccessor: (b) => b.paymentMethod ?? "" },
    {
      key: "action", header: "", width: 56, align: "right", render: (b) => (
        <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
          <PopoverMenu
            ariaLabel="Bill actions"
            trigger={<Icon name="menu" size={20} tone="inherit" style={{ color: colors.neutral700 }} />}
            items={[
              { label: "View bill", onClick: () => openBillModal(b) },
              { label: "Print", onClick: () => (onPrintBill ?? printBill)(b) },
              ...(b.due > 0 ? [{ label: "Record payment", onClick: () => openBillModal(b) }] : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      <PageHeader
        title={
          <>
            <DateRangeDropdown
              presets={PERIODS}
              valueId={period}
              customStart={customStart}
              customEnd={customEnd}
              onSelectPreset={setPeriod}
              onSelectCustom={(start, end) => { setCustomStart(start); setCustomEnd(end); setPeriod("custom"); }}
            />{" "}
            Bills
          </>
        }
        actions={
          <>
            <Button variant="light" size="md" iconLeft={<Icon name="download" size={16} tone="inherit" />} onClick={onExport}>Export</Button>
          </>
        }
      />

      <div style={styles.content}>
        <div style={styles.kpis}>
          <Kpi label="Collected today" value={inr(collectedToday)} />
          <Kpi label="Outstanding" value={inr(outstanding)} tone={colors.red200} />
          <Kpi label={billedLabel(period, customStart, customEnd)} value={inr(billedInRange)} />
          <Kpi label="Bills today" value={String(billsToday)} />
        </div>

        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <SearchField value={query} onChange={setQuery} placeholder="Search patient or invoice no…" />
            <Tabs variant="block" size="sm" inline items={STATUS_TABS} activeId={status} onSelect={setStatus} />
          </div>
        </div>

        <Card variant="cream" padding="xl">
          {shown.length === 0 ? (
            <div style={styles.emptyWrap}>{loading ? "Loading bills…" : "No bills match these filters."}</div>
          ) : (
            <DataGrid
              columns={columns}
              rows={shown}
              rowKey={(b) => b.id}
              size="m"
              tdPadding="14px 12px"
              thPadding="10px 12px"
              onRowClick={openBillModal}
              rowStyle={() => ({ cursor: "pointer" })}
            />
          )}
        </Card>
      </div>

      {/* An unpaid bill is still a draft → the editable BillModal (seeded with
          its line items); a settled bill → the read-only BillReadModal. */}
      {openBill && (openBill.paid === 0 && billStatusOf(openBill) !== "waived" ? (
        <BillModal
          isOpen
          onClose={() => setOpenBill(null)}
          patientName={openBill.patientName}
          invoiceNo={openBill.invoiceNo}
          initialServices={parseLines(openBill.items).map((l) => ({ name: l.name, price: l.unit }))}
          onPaid={(amount, method) => recordPayment(openBill, amount, method)}
          onViewBills={() => { setQuery(openBill.patientName); setOpenBill(null); }}
        />
      ) : (
        <BillReadModal
          key={openBill.id}
          isOpen
          onClose={() => setOpenBill(null)}
          bill={openBill}
          onPrint={onPrintBill ?? printBill}
          onRecordPayment={(b) => recordPayment(b, b.due, b.paymentMethod || "Cash")}
          onViewBills={(b) => { setQuery(b.patientName); setOpenBill(null); }}
          onRefunded={(u) => setFetched((list) => list.map((x) => (x.id === u.id ? u : x)))}
        />
      ))}

      <Toast
        message={toastMessage}
        {...resolveToastIcon(toastMessage)}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
