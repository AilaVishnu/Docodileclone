import React from "react";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { Icon } from "../../components/Icon";
import { shareBill, type PrintPatientMeta } from "./printBill";
import type { Bill } from "../../api/bills";
import { colors } from "../../styles/theme";

// ShareBillMenu — the bill "Share" control. Instead of firing one action, the
// share icon opens a small menu asking HOW to share: WhatsApp, Email, a PDF
// download, or copy the summary to the clipboard. Reused by every bill surface
// (the Bills page, the queue, the New Bill page, the bill editor); each passes
// whatever patient contact it has so WhatsApp/Email can pre-fill a recipient.

type ShareBill = Bill & { patientName: string };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
};

// A short, human-readable summary sent as the WhatsApp / email / clipboard text
// (the PDF carries the full itemised receipt).
function billSummary(bill: ShareBill): string {
  const clinic = localStorage.getItem("docodile_clinic_name") || "";
  return [
    clinic,
    `Bill ${bill.invoiceNo} — ${fmtDate(bill.billDate)}`,
    `Patient: ${bill.patientName}`,
    `Total: ${inr(bill.billed)} · Paid: ${inr(bill.paid)}${bill.due > 0 ? ` · Due: ${inr(bill.due)}` : ""}`,
  ].filter(Boolean).join("\n");
}

// Digits-only phone for wa.me; assume +91 for a bare 10-digit local number.
function waNumber(phone?: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `91${digits}` : digits;
}

export interface ShareBillMenuProps {
  bill: ShareBill;
  /** Patient demographics for the PDF receipt's meta block. */
  patient?: PrintPatientMeta;
  /** Patient phone — pre-fills the WhatsApp recipient. */
  phone?: string;
  /** Patient email — pre-fills the email recipient. */
  email?: string;
  /** Surface a PDF-download failure (the other channels can't fail here). */
  onError?: (message: string) => void;
  /** Trigger element. Defaults to the standard share icon. */
  trigger?: React.ReactNode;
}

export function ShareBillMenu({ bill, patient, phone, email, onError, trigger }: ShareBillMenuProps) {
  const items = [
    {
      label: "WhatsApp",
      icon: <Icon name="message" size={18} tone="inherit" />,
      onClick: () => {
        const num = waNumber(phone);
        const url = `https://wa.me/${num}?text=${encodeURIComponent(billSummary(bill))}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "Email",
      icon: <Icon name="mail" size={18} tone="inherit" />,
      onClick: () => {
        const subject = `Bill ${bill.invoiceNo}`;
        window.location.href = `mailto:${email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(billSummary(bill))}`;
      },
    },
    {
      label: "Download PDF",
      icon: <Icon name="download" size={18} tone="inherit" />,
      onClick: () => {
        Promise.resolve(shareBill(bill, patient)).catch((e) => onError?.((e as Error).message || "Couldn't generate the PDF"));
      },
    },
    {
      label: "Copy details",
      onClick: () => { void navigator.clipboard?.writeText(billSummary(bill))?.catch(() => {}); },
    },
  ];

  return (
    <PopoverMenu
      ariaLabel="Share bill"
      trigger={trigger ?? <Icon name="share" size={24} tone="inherit" style={{ color: colors.neutral900 }} />}
      items={items}
    />
  );
}
