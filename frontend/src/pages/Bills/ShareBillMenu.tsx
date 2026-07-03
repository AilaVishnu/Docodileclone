import React from "react";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { Icon } from "../../components/Icon";
import { shareBill, billPdfFile, resolveClinicName, type PrintPatientMeta } from "./printBill";
import { ensureBillTemplatesLoaded } from "../Settings/BillTemplate/storage";
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
  const clinic = resolveClinicName("");
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

// Can this browser share an actual file (Web Share API level 2)? When yes, the
// native share sheet hands the PDF to WhatsApp / Email / etc. with the file
// attached — the real "share the PDF, not just text". Probed with a dummy PDF.
function supportsFileShare(): boolean {
  try {
    if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return false;
    const probe = new File([new Blob([""], { type: "application/pdf" })], "probe.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
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
  // Prime the default Bill template + clinic identity so billSummary() can name
  // the clinic (same source the printed receipt uses) by the time an item is
  // clicked. Cheap and cached — a no-op after the first call this session.
  React.useEffect(() => { void ensureBillTemplatesLoaded(); }, []);

  // Send the actual PDF via the OS share sheet (WhatsApp / Email / … get the
  // file attached). Falls back to a plain download if the platform can't share
  // files; a dismissed sheet (AbortError) isn't a failure.
  const sharePdf = async () => {
    try {
      const file = await billPdfFile(bill, patient);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Bill ${bill.invoiceNo}`, text: billSummary(bill) });
      } else {
        downloadFile(file);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") onError?.((e as Error).message || "Couldn't share the PDF");
    }
  };
  const whatsapp = {
    label: "WhatsApp",
    icon: <Icon name="message" size={18} tone="inherit" />,
    onClick: () => window.open(`https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(billSummary(bill))}`, "_blank", "noopener,noreferrer"),
  };
  const emailItem = {
    label: "Email",
    icon: <Icon name="mail" size={18} tone="inherit" />,
    onClick: () => { window.location.href = `mailto:${email ?? ""}?subject=${encodeURIComponent(`Bill ${bill.invoiceNo}`)}&body=${encodeURIComponent(billSummary(bill))}`; },
  };
  const downloadPdf = {
    label: "Download PDF",
    icon: <Icon name="download" size={18} tone="inherit" />,
    onClick: () => { Promise.resolve(shareBill(bill, patient)).catch((e) => onError?.((e as Error).message || "Couldn't generate the PDF")); },
  };
  const copyDetails = {
    label: "Copy details",
    onClick: () => { void navigator.clipboard?.writeText(billSummary(bill))?.catch(() => {}); },
  };

  // Where the platform can share a file, lead with "Share PDF" (the native sheet
  // carries the actual PDF to WhatsApp/Email). Otherwise offer the text-only
  // WhatsApp/Email links + a manual PDF download.
  const items = supportsFileShare()
    ? [{ label: "Share PDF", icon: <Icon name="share" size={18} tone="inherit" />, onClick: sharePdf }, downloadPdf, copyDetails]
    : [whatsapp, emailItem, downloadPdf, copyDetails];

  return (
    <PopoverMenu
      ariaLabel="Share bill"
      trigger={trigger ?? <Icon name="share" size={24} tone="inherit" style={{ color: colors.neutral900 }} />}
      items={items}
    />
  );
}
