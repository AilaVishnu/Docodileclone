import React from "react";
import { BillPrint, BillPrintItem } from "../../components/BillPrint/BillPrint";
import { billStatusOf } from "../../components/BillStatusBadge";
// Import straight from the source module (not the Settings barrel) so we don't
// form a cycle: barrel → SettingsPage → BillTemplateEditor → printBill.
import { openPrintWindow, downloadAsPdf, htmlToPdfBlob } from "../Settings/PrintTemplate/buildPrintHtml";
import { parseLines } from "./BillReadModal";
import type { Bill } from "../../api/bills";
import { BillTemplate, DEFAULT_BILL_TEMPLATE } from "../Settings/BillTemplate/types";
import { ensureBillTemplatesLoaded, getDefaultBillTemplate } from "../Settings/BillTemplate/storage";

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

// Clinic name for the receipt letterhead + the share-message text: the default
// Bill template's letterhead wins, else the cached clinic profile, else a
// neutral placeholder. Shared so the printed receipt and the share text agree.
export function resolveClinicName(fallback = "Your Clinic"): string {
  return getDefaultBillTemplate()?.clinicName?.trim() || localStorage.getItem("docodile_clinic_name") || fallback;
}

const PAPER_W = 760;

// BillPrint styles reference the design-system type ramp via CSS custom
// properties (fonts.size.* → var(--fs-*), fonts.control.md → var(--ctrl-fs-md)).
// Those live in globals.css, which the print/iframe document doesn't load — so
// we inline the desktop (interval-2) values here. Without this every size
// collapses to the 16px default and the receipt looks flat vs. Storybook.
const TOKENS_CSS =
  ":root{--fs-h1:60px;--fs-h2:48px;--fs-h3:40px;--fs-h4:32px;--fs-h5:24px;--fs-h6:20px;" +
  "--fs-l:20px;--fs-m:16px;--fs-s:14px;--fs-xs:12px;--fs-caption:11px;" +
  "--lh-h1:72px;--lh-h2:56px;--lh-h3:48px;--lh-h4:44px;--lh-h5:34px;--lh-h6:28px;" +
  "--lh-l:28px;--lh-m:22px;--lh-s:20px;--lh-xs:16px;--lh-caption:14px;" +
  "--ctrl-fs-lg:18px;--ctrl-fs-md:16px;--ctrl-fs-sm:14px;--ctrl-fs-xs:12px}";

// The design-system secondary face (fonts.family.secondary → 'Libertinus Serif')
// used for the clinic name + money. The app itself doesn't self-host it, so the
// print doc loads it from the fontsource CDN — if unreachable the family simply
// falls through to the next in BillPrint's chain (serif), so the receipt still
// renders, just in a system serif.
const FONTS_CSS =
  "@font-face{font-family:'Libertinus Serif';font-style:normal;font-weight:400;font-display:swap;" +
  "src:url(https://cdn.jsdelivr.net/fontsource/fonts/libertinus-serif@latest/latin-400-normal.woff2) format('woff2')}" +
  "@font-face{font-family:'Libertinus Serif';font-style:normal;font-weight:600;font-display:swap;" +
  "src:url(https://cdn.jsdelivr.net/fontsource/fonts/libertinus-serif@latest/latin-600-normal.woff2) format('woff2')}";

// Render a clinic bill to the "Bill cum Receipt" HTML document — the shared
// BillPrint component to static markup, wrapped in an A4 page. Driven by the
// clinic's default Bill template (Config → Bill template); falls back to a
// built-in default when none is loaded. Used by the print (browser dialog),
// share (PDF download) and file paths so they stay identical. Pass an explicit
// `template` (e.g. the editor's live preview) to override the default.
export async function buildBillHtml(
  bill: Bill & { patientName: string },
  patient?: PrintPatientMeta,
  template?: BillTemplate,
): Promise<string> {
  // Lazy-load the server renderer so it only ships when someone actually prints
  // (keeps ~50kB of react-dom/server out of the main bundle).
  const { renderToStaticMarkup } = await import("react-dom/server");
  let t = template;
  if (!t) {
    await ensureBillTemplatesLoaded();
    t = getDefaultBillTemplate() ?? { id: "", ...DEFAULT_BILL_TEMPLATE };
  }

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

  const clinicName = t.clinicName?.trim() || localStorage.getItem("docodile_clinic_name") || "Your Clinic";
  const blank = t.paperMode === "blank";
  // Pre-printed paper (or an uploaded header image) already carries the clinic
  // identity, so skip the rendered text letterhead.
  const hideLetterhead = t.paperMode === "preprinted" || (blank && !!t.headerImage);

  const markup = renderToStaticMarkup(
    <BillPrint
      clinic={{
        name: clinicName,
        address: t.clinicAddress?.trim() || localStorage.getItem("docodile_clinic_address") || "",
        phone: t.clinicPhone?.trim() || localStorage.getItem("docodile_clinic_phone") || undefined,
        email: t.clinicEmail || undefined,
        logo: t.logoImage ? <img src={t.logoImage} alt="" style={{ height: 56, objectFit: "contain" }} /> : undefined,
      }}
      patient={{ name: bill.patientName, age: patient?.age, gender: patient?.gender, mobile: patient?.mobile, id: patient?.id }}
      invoiceNo={bill.invoiceNo}
      billDate={fmtDate(bill.billDate)}
      status={billStatusOf(bill)}
      items={items}
      gstAmount={gstAmount}
      received={bill.paid}
      paymentMode={bill.paymentMethod ?? undefined}
      width={PAPER_W}
      title={t.title}
      gstin={t.gstin || undefined}
      accentColor={t.accentColor}
      termsText={t.termsText || undefined}
      signature={{ image: t.signatureImage, heightMm: t.signatureHeightMm, text: t.signatureText, seal: t.sealImage }}
      fontFamily={t.fontFamily}
      hideLetterhead={hideLetterhead}
      showDiscountCol={t.show.discountCol}
      showGstRow={t.show.gstRow}
      showAmountInWords={t.show.amountInWords}
      showPaymentMode={t.show.paymentMode}
      showReferredBy={t.show.referredBy}
      showPatientId={t.show.patientId}
      showPatientAddress={t.show.patientAddress}
      showPatientMobile={t.show.patientMobile}
      showReceivedRow={t.show.receivedRow}
      showBalanceRow={t.show.balanceRow}
    />,
  );

  const m = t.margins;
  const band = (src?: string, foot?: boolean) => (blank && src ? `<img class="band${foot ? " foot" : ""}" src="${src}" alt="" />` : "");
  const fontFam = t.fontFamily || "Inter, Helvetica, Arial, sans-serif";

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${TOKENS_CSS}${FONTS_CSS}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{font-family:${fontFam}}.wrap{width:${PAPER_W}px;background:#fff;display:flex;flex-direction:column;transform-origin:top left}.band{width:100%;display:block}.foot{margin-top:auto}@media screen{html,body{overflow:hidden}body{padding:16px;background:#e5e5e5}.wrap{min-height:calc(${PAPER_W}px * 297 / 210)}}@media print{body{display:flex;justify-content:center}.wrap{transform:none !important;min-height:0}}@page{size:A4;margin:${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm}</style>
</head><body><div class="wrap">${band(t.headerImage)}${markup}${band(t.footerImage, true)}</div>
<script>
  /* Fit-to-view for the SCREEN preview only: scale the fixed-width receipt down
     so the whole page (incl. the right-aligned totals) is visible without
     horizontal scroll. Disabled for print via @media print + the print check. */
  (function(){
    if (window.matchMedia && window.matchMedia('print').matches) return;
    var w = document.querySelector('.wrap'); if (!w) return;
    function fit(){
      w.style.transform = '';
      var aw = document.documentElement.clientWidth - 32;
      var ah = document.documentElement.clientHeight - 32;
      var s = Math.min(1, aw / w.scrollWidth, ah / w.scrollHeight);
      if (s < 1) w.style.transform = 'scale(' + s + ')';
    }
    fit();
    window.addEventListener('resize', fit);
    Array.prototype.forEach.call(document.images, function(i){ if (!i.complete) i.addEventListener('load', fit); });
  })();
</script>
</body></html>`;
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
