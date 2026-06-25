import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { BillsView, ClinicBill } from "./BillsView";
import type { Bill } from "../../api/bills";
import { colors } from "../../styles/theme";

// Clinic-wide bills (joined with patient name). No clinic-wide endpoint exists
// yet — listBills is per-patient — so a real wiring needs a /api/bills route.
const B = (p: Partial<ClinicBill>): ClinicBill => ({
  id: p.invoiceNo!, invoiceNo: "", billDate: "", billed: 0, paid: 0, due: 0, refund: 0,
  depositApplied: null, payStatus: null, paymentMethod: null, items: null, appointmentId: null,
  createdAt: "", patientName: "", ...p,
}) as ClinicBill;

const BILLS: ClinicBill[] = [
  B({ patientName: "Ramesh Babu", invoiceNo: "INV-2026-0042", billDate: "2026-06-24", billed: 1850, paid: 1850, due: 0, paymentMethod: "UPI", today: true }),
  B({ patientName: "Sunita Rao", invoiceNo: "INV-2026-0041", billDate: "2026-06-24", billed: 3200, paid: 1500, due: 1700, paymentMethod: "Card", today: true }),
  B({ patientName: "Imran Khan", invoiceNo: "INV-2026-0040", billDate: "2026-06-24", billed: 600, paid: 600, due: 0, paymentMethod: "Cash", today: true }),
  B({ patientName: "Priya Nair", invoiceNo: "INV-2026-0039", billDate: "2026-06-24", billed: 2400, paid: 0, due: 2400, paymentMethod: null, today: true }),
  B({ patientName: "Arjun Mehta", invoiceNo: "INV-2026-0038", billDate: "2026-06-23", billed: 900, paid: 900, due: 0, paymentMethod: "UPI" }),
  B({ patientName: "Fatima Sheikh", invoiceNo: "INV-2026-0037", billDate: "2026-06-23", billed: 4500, paid: 2000, due: 2500, paymentMethod: "Card" }),
  B({ patientName: "Vikram Singh", invoiceNo: "INV-2026-0036", billDate: "2026-06-22", billed: 1200, paid: 1200, due: 0, paymentMethod: "Cash" }),
  B({ patientName: "Lakshmi Iyer", invoiceNo: "INV-2026-0035", billDate: "2026-06-21", billed: 800, paid: 800, due: 0, refund: 200, paymentMethod: "UPI" }),
  B({ patientName: "Meena Joshi", invoiceNo: "INV-2026-0034", billDate: "2026-06-20", billed: 500, paid: 0, due: 0, payStatus: "WAIVED", paymentMethod: "Waive" }),
];

// Frame the view like the app shell's main content (primary200 app background).
const inShell = (Story: React.ComponentType) => (
  <div style={{ position: "relative", height: "100vh", width: "100%", backgroundColor: colors.primary200, overflow: "hidden" }}>
    <Story />
  </div>
);

const meta = {
  title: "Pages/Bills",
  component: BillsView,
  decorators: [inShell],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The clinic-wide Bills page (sidebar 'Billing' module). Composed from existing components — PageHeader, Card (KPI tiles + cream list), Tabs (status filter), DateRangeDropdown (period), DataGrid (invoice table). Needs a clinic-wide bills endpoint to wire for real (listBills is per-patient).",
      },
    },
  },
} satisfies Meta<typeof BillsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clinic Bills page with a mixed set of invoices. */
export const Default: Story = { render: () => <BillsView bills={BILLS} /> };

/** Empty — no bills in range. */
export const Empty: Story = { render: () => <BillsView bills={[] as ClinicBill[]} /> };
