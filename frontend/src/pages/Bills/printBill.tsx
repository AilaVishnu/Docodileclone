import React from "react";
import { BillPrint, BillPrintItem } from "../../components/BillPrint/BillPrint";
import { billStatusOf } from "../../components/BillStatusBadge";
import { openPrintWindow } from "../Settings";
import { parseLines } from "./BillReadModal";
import type { Bill } from "../../api/bills";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
};

// Print a clinic bill as the "Bill cum Receipt" — the shared BillPrint component
// rendered to static HTML and sent to the browser print dialog via the same
// off-screen iframe the prescription print uses (openPrintWindow).
export async function printBill(bill: Bill & { patientName: string }): Promise<void> {
  // Lazy-load the server renderer so it only ships when someone actually prints
  // (keeps ~50kB of react-dom/server out of the main bundle).
  const { renderToStaticMarkup } = await import("react-dom/server");
  const lines = parseLines(bill.items);
  const items: BillPrintItem[] = lines.map((l) => ({
    name: l.name,
    qty: l.qty,
    price: l.unit,
    // BillPrint's per-line discount is a ₹ figure — resolve a % line to rupees.
    discount: l.discUnit === "%" ? Math.round(l.qty * l.unit * (l.disc / 100)) : l.disc,
  }));
  const gstAmount = Math.round(
    lines.reduce((s, l) => {
      const disc = l.discUnit === "%" ? l.qty * l.unit * (l.disc / 100) : l.disc;
      return s + (l.qty * l.unit - disc) * (l.gst / 100);
    }, 0),
  );

  const markup = renderToStaticMarkup(
    <BillPrint
      clinic={{ name: localStorage.getItem("docodile_clinic_name") || "Your Clinic", address: "" }}
      patient={{ name: bill.patientName }}
      invoiceNo={bill.invoiceNo}
      billDate={fmtDate(bill.billDate)}
      status={billStatusOf(bill)}
      items={items}
      gstAmount={gstAmount}
      received={bill.paid}
      paymentMode={bill.paymentMethod ?? undefined}
    />,
  );

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{display:flex;justify-content:center}@media screen{body{padding:16px;background:#e5e5e5}}@page{size:A4;margin:12mm}</style>
</head><body>${markup}</body></html>`;

  openPrintWindow(html);
}
