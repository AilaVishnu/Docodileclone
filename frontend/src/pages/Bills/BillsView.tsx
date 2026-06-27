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
import type { Bill } from "../../api/bills";
import { colors, spacing } from "../../styles/theme";
import { styles } from "./BillsView.styles";

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

export interface BillsViewProps {
  /** Clinic-wide bills (joined with patient name). */
  bills: ClinicBill[];
  loading?: boolean;
  onOpenBill?: (bill: ClinicBill) => void;
  onPrintBill?: (bill: ClinicBill) => void;
  onNewBill?: () => void;
  onExport?: () => void;
}

/**
 * Clinic-wide Bills page (the sidebar "Billing" module). PageHeader → KPI strip
 * → search + status/period filters → invoice table. Composed from existing
 * components (Card, Tabs, DateRangeDropdown, DataGrid, PageHeader, Button).
 */
export function BillsView({ bills, loading = false, onOpenBill, onPrintBill, onNewBill, onExport }: BillsViewProps) {
  const [status, setStatus] = React.useState("all");
  const [period, setPeriod] = React.useState("today");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");
  const [query, setQuery] = React.useState("");
  // Row-click / "View bill" opens the bill: an unpaid draft → the editable
  // BillModal (seeded); anything settled → the read-only BillReadModal.
  const [openBill, setOpenBill] = React.useState<ClinicBill | null>(null);
  const openBillModal = (b: ClinicBill) => { setOpenBill(b); onOpenBill?.(b); };

  const collectedToday = bills.filter((b) => b.today).reduce((s, b) => s + b.paid, 0);
  const outstanding = bills.reduce((s, b) => s + b.due, 0);
  const billedMonth = bills.reduce((s, b) => s + b.billed, 0);
  const billsToday = bills.filter((b) => b.today).length;

  const q = query.trim().toLowerCase();
  const shown = bills.filter((b) => {
    const statusOk = status === "all" || billStatusOf(b) === status;
    const queryOk = !q || b.patientName.toLowerCase().includes(q) || b.invoiceNo.toLowerCase().includes(q);
    return statusOk && queryOk;
  });

  const columns: GridColumn<ClinicBill>[] = [
    { key: "patient", header: "Patient", align: "left", render: (b) => b.patientName },
    {
      key: "inv", header: "Invoice & date", align: "left", render: (b) => (
        <div style={styles.invCell}>
          <span>{b.invoiceNo}</span>
          <span style={styles.muted}>{fmtDate(b.billDate)}</span>
        </div>
      ),
    },
    { key: "billed", header: "Billed", align: "right", render: (b) => inr(b.billed) },
    { key: "paid", header: "Paid", align: "right", render: (b) => inr(b.paid) },
    { key: "due", header: "Due", align: "right", render: (b) => (b.due > 0 ? <span style={styles.due}>{inr(b.due)}</span> : <span style={styles.muted}>–</span>) },
    { key: "status", header: "Status", width: 132, align: "left", render: (b) => <BillStatusBadge status={billStatusOf(b)} /> },
    { key: "method", header: "Method", width: 96, align: "left", render: (b) => b.paymentMethod ?? "–" },
    {
      key: "action", header: "", width: 56, align: "right", render: (b) => (
        <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
          <PopoverMenu
            ariaLabel="Bill actions"
            trigger={<Icon name="menu" size={20} tone="inherit" style={{ color: colors.neutral700 }} />}
            items={[
              { label: "View bill", onClick: () => openBillModal(b) },
              { label: "Print", onClick: () => onPrintBill?.(b) },
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
            <Button variant="dark" size="md" iconLeft={<Icon name="plus" size={16} tone="inherit" />} onClick={onNewBill}>New bill</Button>
          </>
        }
      />

      <div style={styles.content}>
        <div style={styles.kpis}>
          <Kpi label="Collected today" value={inr(collectedToday)} />
          <Kpi label="Outstanding" value={inr(outstanding)} tone={colors.red200} />
          <Kpi label="Billed this month" value={inr(billedMonth)} />
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
      {openBill && (openBill.paid === 0 ? (
        <BillModal
          isOpen
          onClose={() => setOpenBill(null)}
          patientName={openBill.patientName}
          invoiceNo={openBill.invoiceNo}
          initialServices={parseLines(openBill.items).map((l) => ({ name: l.name, price: l.unit }))}
        />
      ) : (
        <BillReadModal
          key={openBill.id}
          isOpen
          onClose={() => setOpenBill(null)}
          bill={openBill}
          onPrint={onPrintBill}
        />
      ))}
    </div>
  );
}
