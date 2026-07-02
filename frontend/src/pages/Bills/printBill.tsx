import React from "react";
import { BillPrint, BillPrintItem } from "../../components/BillPrint/BillPrint";
import { billStatusOf } from "../../components/BillStatusBadge";
import { openPrintWindow, downloadAsPdf, htmlToPdfBlob } from "../Settings";
import { parseLines } from "./BillReadModal";
import type { Bill } from "../../api/bills";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
};

// Optional patient demographics printed in the receipt's meta block. The bill
// record itself carries only the patient's name, so the caller (the Bills page)
// resolves these from its loaded patient list and passes them in — omitted when
// the patient can't be resolved unambiguously, leaving just the name.
export type PrintPatientMeta = { age?: number; gender?: string; mobile?: string; id?: string };

// Render a clinic bill to the "Bill cum Receipt" HTML document — the shared
// BillPrint component to static markup, wrapped in an A4 page. Used by both the
// print (browser dialog) and share (PDF download) paths so they stay identical.
async function buildBillHtml(bill: Bill & { patientName: string }, patient?: PrintPatientMeta): Promise<string> {
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
      patient={{ name: bill.patientName, age: patient?.age, gender: patient?.gender, mobile: patient?.mobile, id: patient?.id }}
      invoiceNo={bill.invoiceNo}
      billDate={fmtDate(bill.billDate)}
      status={billStatusOf(bill)}
      items={items}
      gstAmount={gstAmount}
      received={bill.paid}
      paymentMode={bill.paymentMethod ?? undefined}
    />,
  );

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{display:flex;justify-content:center}@media screen{body{padding:16px;background:#e5e5e5}}@page{size:A4;margin:12mm}</style>
</head><body>${markup}</body></html>`;
}

// Print a clinic bill as the "Bill cum Receipt" — sent to the browser print
// dialog via the same off-screen iframe the prescription print uses.
export async function printBill(bill: Bill & { patientName: string }, patient?: PrintPatientMeta): Promise<void> {
  openPrintWindow(await buildBillHtml(bill, patient));
}

// Share a clinic bill: render the same receipt and download it as a real PDF
// (via the backend /api/print/pdf service the prescription download uses), so
// the desk gets a file it can send to the patient (WhatsApp / email).
export async function shareBill(bill: Bill & { patientName: string }, patient?: PrintPatientMeta): Promise<void> {
  const safeInvoice = (bill.invoiceNo || "receipt").replace(/[^\w-]+/g, "_");
  await downloadAsPdf(await buildBillHtml(bill, patient), `Bill-${safeInvoice}`);
}

// The receipt as an actual PDF File — for the Web Share API (navigator.share),
// which hands the file to WhatsApp / Email / etc. with the PDF attached (not
// just a text link). Same rendering as print/download.
export async function billPdfFile(bill: Bill & { patientName: string }, patient?: PrintPatientMeta): Promise<File> {
  const safeInvoice = (bill.invoiceNo || "receipt").replace(/[^\w-]+/g, "_");
  const blob = await htmlToPdfBlob(await buildBillHtml(bill, patient), `Bill-${safeInvoice}`);
  return new File([blob], `Bill-${safeInvoice}.pdf`, { type: "application/pdf" });
}
