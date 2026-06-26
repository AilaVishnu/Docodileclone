import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { BillReadModal } from "./BillReadModal";
import { BillModal } from "../../components/BillCard/BillModal";
import type { ClinicBill } from "./BillsView";

/**
 * The row-click modal across every bill state. UNPAID is still a draft, so the
 * editable `BillModal` opens (seeded). Anything settled — Partial / Paid /
 * Refunded / Waived — opens the read-only `BillReadModal`, which mirrors the
 * editor's frame with the committed line items frozen. A Partial bill also lets
 * the desk append new services and collect the outstanding balance.
 */

const noop = () => {};

// Build the `items` JSON snapshot (the shape BillReadModal reads back).
type Row = [string, number, number, number?, number?, ("%" | "₹")?];
const it = (...rows: Row[]) =>
  JSON.stringify(rows.map(([name, qty, unit, gst = 0, disc = 0, discUnit = "₹"]) => ({ name, qty, unit, gst, disc, discUnit, kind: "service" })));

const mk = (p: Partial<ClinicBill>): ClinicBill => ({
  id: p.invoiceNo!, invoiceNo: "", billDate: "", billed: 0, paid: 0, due: 0, refund: 0,
  depositApplied: null, payStatus: null, paymentMethod: null, items: null, appointmentId: null,
  createdAt: "", patientName: "", ...p,
});

const DUE_BILL = mk({
  patientName: "Sunita Rao", invoiceNo: "INV-2026-0041", billDate: "2026-06-24", paymentMethod: "Card",
  billed: 3000, paid: 1500, due: 1810,
  items: it(["Consultation", 1, 600], ["Minor procedure — wound dressing", 1, 2000, 18], ["Dressing kit", 2, 200, 0, 50]),
});
const PAID_BILL = mk({
  patientName: "Ramesh Babu", invoiceNo: "INV-2026-0042", billDate: "2026-06-24", paymentMethod: "UPI",
  billed: 1800, paid: 1715, due: 0,
  items: it(["Consultation", 1, 500], ["Cetirizine 10mg", 10, 30, 5], ["Mometasone cream", 1, 1000, 0, 10, "%"]),
});
const REFUND_BILL = mk({
  patientName: "Lakshmi Iyer", invoiceNo: "INV-2026-0035", billDate: "2026-06-21", paymentMethod: "UPI", refund: 200,
  billed: 720, paid: 720, due: 0,
  items: it(["Lab — CBC panel", 1, 600], ["Paracetamol 650mg", 1, 120]),
});
const WAIVED_BILL = mk({
  patientName: "Anil Kumar", invoiceNo: "INV-2026-0033", billDate: "2026-06-19", payStatus: "WAIVED",
  billed: 500, paid: 0, due: 0,
  items: it(["Follow-up consultation", 1, 500]),
});

const meta = {
  title: "Pages/Bills/Bill modal states",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** UNPAID (nothing collected) — a draft, so the editable BillModal opens, seeded
 *  with the bill's line items. The only state where line items can be edited. */
export const UnpaidEditable: Story = {
  render: () => (
    <BillModal isOpen onClose={noop} patientName="Priya Nair" invoiceNo="INV-2026-0039"
      initialServices={[{ name: "Consultation", price: 600 }, { name: "Minor procedure", price: 1800 }]} />
  ),
};

/** PARTIAL — committed lines frozen, but new services can be appended (raising
 *  Total + Balance); prior payment locked + one live row for the balance. */
export const PartialRecordPayment: Story = { render: () => <BillReadModal isOpen onClose={noop} bill={DUE_BILL} /> };

/** PAID in full — read receipt; Refund. */
export const PaidReceipt: Story = { render: () => <BillReadModal isOpen onClose={noop} bill={PAID_BILL} /> };

/** REFUNDED — read receipt; no action. */
export const Refunded: Story = { render: () => <BillReadModal isOpen onClose={noop} bill={REFUND_BILL} /> };

/** WAIVED — charge forgiven; no action. */
export const Waived: Story = { render: () => <BillReadModal isOpen onClose={noop} bill={WAIVED_BILL} /> };
