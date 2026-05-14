// ─────────────────────────────────────────────────────────────────────────────
// Build a self-contained HTML document for printing a prescription using a
// configured template. Designed for use in an off-screen iframe — the
// document carries its own `<style>` block including @page rules and a print
// media query, then auto-triggers window.print() once images are loaded.
//
// Two paper modes:
//   • "preprinted" — only the body is rendered. Margins are set wide so the
//     body text falls within the clinic's pre-printed letterhead's blank
//     zone. No header/footer images are emitted.
//   • "blank" — header image (if any), body, footer image (if any). Header
//     and footer are positioned at the top/bottom edges so they render on
//     every printed page via @page margin boxes when supported, with a
//     fallback that pins them inside a printable container.
//
// The PrintVisitData input is intentionally loose — the caller assembles it
// from whatever sources it has (Visit DTO + Patient + Doctor lookups). This
// file does no fetching.
// ─────────────────────────────────────────────────────────────────────────────

import { PrintTemplate } from "./types";

export type PrintRxRow = {
  medicine?: string | null;
  // Generic / molecule name — printed in parentheses next to the brand
  // name when the template has `showGenericName` enabled.
  genericName?: string | null;
  dosage?: string | null;
  whenToTake?: string | null;
  frequency?: string | null;
  duration?: string | null;
  notes?: string | null;
};

export type PrintVisitData = {
  // Patient
  patientName: string;
  patientAge?: string | null;
  patientGender?: string | null;
  patientPhone?: string | null;
  patientAddress?: string | null;
  patientId?: string | null;

  // Visit meta
  visitNumber?: string | number | null;
  visitDate?: string | null; // ISO yyyy-MM-dd
  visitTime?: string | null; // HH:mm display
  referredBy?: string | null;

  // Doctor
  doctorName?: string | null;
  doctorCredentials?: string | null;

  // Clinical
  complaints?: string | null;
  diagnosis?: string | null;
  vitals?: { label: string; value: string }[];
  tests?: string | null;
  notesForPatient?: string | null;

  // Prescriptions
  rx: PrintRxRow[];

  // Follow-up
  reviewDate?: string | null;
  reviewNotes?: string | null;
};

function esc(v: unknown): string {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function capitalize(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Build the body — patient meta + clinical sections + Rx + signature.
function renderBody(t: PrintTemplate, data: PrintVisitData): string {
  const name = t.capitalizePatientName ? capitalize(data.patientName) : data.patientName;

  // Compute "Valid till" if configured: visit date + validityDays. Falls
  // back to today if no visit date.
  let validTillStr: string | null = null;
  if (t.show.validTill && t.validityDays && t.validityDays > 0) {
    const base = data.visitDate ? new Date(data.visitDate) : new Date();
    if (!Number.isNaN(base.getTime())) {
      base.setDate(base.getDate() + t.validityDays);
      validTillStr = base.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
  }

  // Patient meta row: name on the left, configurable fields on the right.
  const metaRight: string[] = [];
  if (t.show.visitDate && data.visitDate)        metaRight.push(`<strong>Date:</strong> ${esc(fmtDate(data.visitDate))}`);
  if (t.show.visitTime && data.visitTime)        metaRight.push(`<strong>Time:</strong> ${esc(data.visitTime)}`);
  if (t.show.visitNumber && data.visitNumber != null) metaRight.push(`<strong>Visit #:</strong> ${esc(data.visitNumber)}`);
  if (t.show.referredBy && data.referredBy)      metaRight.push(`<strong>Ref. by:</strong> ${esc(data.referredBy)}`);
  if (t.show.doctorName && data.doctorName)      metaRight.push(`<strong>Doctor:</strong> ${esc(data.doctorName)}`);
  if (validTillStr)                              metaRight.push(`<strong>Valid till:</strong> ${esc(validTillStr)}`);

  const metaLeft: string[] = [];
  const ageGender: string[] = [];
  if (t.show.age && data.patientAge)             ageGender.push(esc(data.patientAge));
  if (t.show.gender && data.patientGender)       ageGender.push(esc(data.patientGender));
  if (ageGender.length)                          metaLeft.push(`<span class="ag">(${ageGender.join(", ")})</span>`);
  if (t.show.patientId && data.patientId)        metaLeft.push(`<span class="pid">ID: ${esc(data.patientId)}</span>`);
  if (t.show.phone && data.patientPhone)         metaLeft.push(`<span class="phone">${esc(data.patientPhone)}</span>`);
  if (t.show.address && data.patientAddress)     metaLeft.push(`<span class="addr">${esc(data.patientAddress)}</span>`);

  const patientBlock = `
    <div class="patient-row">
      <div class="patient-left">
        <div class="patient-name">${esc(name)}${metaLeft[0] ? " " + metaLeft[0] : ""}</div>
        ${metaLeft.slice(1).map((m) => `<div class="patient-meta">${m}</div>`).join("")}
      </div>
      <div class="patient-right">
        ${metaRight.map((m) => `<div>${m}</div>`).join("")}
      </div>
    </div>
  `;

  // Clinical sections — only render those with data.
  const sections: string[] = [];
  const sec = (label: string, content?: string | null) => {
    const c = (content ?? "").trim();
    if (!c) return;
    sections.push(`
      <section class="block">
        <div class="block-label">${esc(label)}</div>
        <div class="block-body">${esc(c).replace(/\n/g, "<br/>")}</div>
      </section>
    `);
  };
  sec("Complaints", data.complaints);
  if (data.vitals && data.vitals.length) {
    const vt = data.vitals
      .filter((v) => v.value && v.value.trim() !== "")
      .map((v) => `<span class="vital"><span class="vital-label">${esc(v.label)}:</span> ${esc(v.value)}</span>`)
      .join("");
    if (vt) {
      sections.push(`
        <section class="block">
          <div class="block-label">Vitals</div>
          <div class="block-body vitals">${vt}</div>
        </section>
      `);
    }
  }
  sec("Diagnosis", data.diagnosis);
  sec("Tests / Investigations", data.tests);

  // Rx — list or tabular.
  if (data.rx && data.rx.length) {
    const filtered = data.rx.filter((r) => (r.medicine ?? "").trim() !== "");
    if (filtered.length) {
      // medicineLabel includes generic name in parens when the toggle is on
      // and a generic was captured for that row.
      const medicineLabel = (r: PrintRxRow): string => {
        const med = esc(r.medicine ?? "");
        if (t.showGenericName && r.genericName && r.genericName.trim() !== "") {
          return `${med} <span class="rx-generic">(${esc(r.genericName)})</span>`;
        }
        return med;
      };

      if (t.rxLayout === "tabular") {
        sections.push(`
          <section class="block rx">
            <div class="block-label rx-label">℞ Prescription</div>
            <table class="rx-table">
              <thead>
                <tr>
                  <th>#</th><th>Medicine</th><th>Dosage</th><th>When</th><th>Frequency</th><th>Duration</th><th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map(
                    (r, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${medicineLabel(r)}</td>
                    <td>${esc(r.dosage)}</td>
                    <td>${esc(r.whenToTake)}</td>
                    <td>${esc(r.frequency)}</td>
                    <td>${esc(r.duration)}</td>
                    <td>${esc(r.notes)}</td>
                  </tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
          </section>
        `);
      } else {
        sections.push(`
          <section class="block rx">
            <div class="block-label rx-label">℞ Prescription</div>
            <ol class="rx-list">
              ${filtered
                .map(
                  (r) => `
                <li>
                  <div class="rx-line-1"><strong>${medicineLabel(r)}</strong>${r.dosage ? ` — ${esc(r.dosage)}` : ""}</div>
                  <div class="rx-line-2">
                    ${[r.whenToTake, r.frequency, r.duration].filter(Boolean).map((p) => `<span>${esc(p as string)}</span>`).join(" · ")}
                  </div>
                  ${r.notes ? `<div class="rx-notes">${esc(r.notes)}</div>` : ""}
                </li>`,
                )
                .join("")}
            </ol>
          </section>
        `);
      }
    }
  }

  sec("Advice", data.notesForPatient);

  if (data.reviewDate || data.reviewNotes) {
    sections.push(`
      <section class="block">
        <div class="block-label">Follow-up</div>
        <div class="block-body">
          ${data.reviewDate ? `<div><strong>Review on:</strong> ${esc(fmtDate(data.reviewDate))}</div>` : ""}
          ${data.reviewNotes ? `<div>${esc(data.reviewNotes).replace(/\n/g, "<br/>")}</div>` : ""}
        </div>
      </section>
    `);
  }

  // Signature block.
  const sigImg = t.signatureImage ? `<img class="sig-img" src="${t.signatureImage}" alt="signature" style="height:${t.signatureHeightMm}mm" />` : "";
  const sigText = t.signatureText
    ? `<div class="sig-text">${esc(t.signatureText).replace(/\n/g, "<br/>")}</div>`
    : data.doctorName
    ? `<div class="sig-text">${esc(data.doctorName)}${data.doctorCredentials ? `<br/><span class="sig-creds">${esc(data.doctorCredentials)}</span>` : ""}</div>`
    : "";
  const seal = t.sealImage ? `<img class="seal-img" src="${t.sealImage}" alt="seal" />` : "";
  const signatureBlock = sigImg || sigText
    ? `<div class="signature">
         ${seal}
         <div class="sig-stack">${sigImg}${sigText}</div>
       </div>`
    : "";

  return patientBlock + sections.join("") + signatureBlock;
}

export function buildPrintHtml(template: PrintTemplate, data: PrintVisitData): string {
  const blank = template.paperMode === "blank";
  const headerImg = blank && template.headerImage
    ? `<div class="hdr"><img src="${template.headerImage}" alt="header" /></div>`
    : "";
  const footerImg = blank && template.footerImage
    ? `<div class="ftr"><img src="${template.footerImage}" alt="footer" /></div>`
    : "";

  const m = template.margins;
  const body = renderBody(template, data);

  // Body wrapped in .body-pad so the user-configured margins apply only to
  // the body — never to header/footer (which sit flush at page edges).
  const sheet = blank
    ? `${headerImg}<div class="body-pad">${body}</div>${footerImg}`
    : `<div class="body-pad">${body}</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Prescription — ${esc(data.patientName)}</title>
<style>
  /* Browser margins set to 0 so the header/footer images can sit flush at
     the page edges in blank-A4 mode. The body's user-configured margins
     are applied to .body-pad inside the sheet instead. */
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: ${template.fontFamily};
    font-size: ${template.fontSizePt}pt;
    color: #111;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    /* No scrollbar on the iframe — the screen preview is a fit-to-view
       snapshot. A small JS snippet below scales .sheet down so the whole
       prescription fits in the iframe's visible area. */
    overflow: hidden;
  }
  /* Screen preview fits whatever iframe width is available (the iframe
     enforces A4 aspect-ratio externally). For print the sheet expands to
     the real A4 page. */
  .sheet {
    width: 100%;
    min-height: 100%;
    margin: 0 auto;
    background: white;
    display: flex;
    flex-direction: column;
    position: relative;
    transform-origin: top center;
  }
  @media print {
    html, body { overflow: visible; }
    .sheet { width: auto; min-height: 0; margin: 0; transform: none !important; }
  }

  /* Header / footer are edge-to-edge: full page width, no horizontal
     padding, sitting flush at the top and bottom of the sheet. They render
     only in blank-A4 mode (in preprinted mode the letterhead's printed
     design covers the same physical area, so we emit nothing). */
  .hdr, .ftr { width: 100%; flex-shrink: 0; display: block; }
  .hdr img, .ftr img { width: 100%; height: auto; display: block; }
  .ftr { margin-top: auto; } /* pin footer to bottom when body is short */

  /* Body padding = the user-configured margins. This is the only place
     they apply — header/footer ignore them by design. */
  .body-pad {
    padding: ${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm;
    flex: 1 0 auto;
  }

  .patient-row {
    display: flex; justify-content: space-between; gap: 8mm;
    border-top: 1px dashed #999;
    border-bottom: 1px dashed #999;
    padding: 3mm 0;
    margin-bottom: 4mm;
  }
  .patient-name { font-size: ${template.fontSizePt + 2}pt; font-weight: 600; }
  .patient-name .ag, .patient-name .phone, .patient-name .addr {
    font-weight: 400; color: #444; margin-left: 4mm;
  }
  .patient-meta { color: #444; font-size: ${template.fontSizePt - 1}pt; }
  .patient-right { text-align: right; font-size: ${template.fontSizePt - 1}pt; color: #222; }
  .patient-right > div + div { margin-top: 1mm; }

  .block { margin: 3mm 0; page-break-inside: avoid; }
  .block-label {
    font-weight: 600; color: #444;
    text-transform: uppercase; letter-spacing: 0.5px;
    font-size: ${template.fontSizePt - 1}pt;
    margin-bottom: 1mm;
  }
  .block-body { line-height: 1.5; }

  .vitals { display: flex; flex-wrap: wrap; gap: 4mm 8mm; }
  .vital-label { color: #555; }

  .rx { margin-top: 5mm; }
  .rx-label { color: #1a1a1a; font-size: ${template.fontSizePt}pt; }
  .rx-list { margin: 0; padding-left: 7mm; }
  .rx-list li { margin: 2mm 0; line-height: 1.4; }
  .rx-line-1 { font-size: ${template.fontSizePt}pt; }
  .rx-line-2 { color: #444; font-size: ${template.fontSizePt - 1}pt; }
  .rx-notes { color: #555; font-style: italic; font-size: ${template.fontSizePt - 1}pt; }
  .rx-generic { font-weight: 400; color: #555; font-size: ${template.fontSizePt - 1}pt; }

  .rx-table {
    width: 100%; border-collapse: collapse;
    font-size: ${template.fontSizePt - 1}pt;
  }
  .rx-table th, .rx-table td {
    border: 1px solid #ccc; padding: 2mm 3mm; text-align: left; vertical-align: top;
  }
  .rx-table th { background: #f5f5f5; font-weight: 600; }

  .signature {
    margin-top: 16mm;
    display: flex; justify-content: flex-end; align-items: flex-end; gap: 10mm;
    page-break-inside: avoid;
  }
  .seal-img { max-height: 28mm; max-width: 40mm; opacity: 0.85; }
  .sig-stack { text-align: right; }
  .sig-img { display: block; margin-left: auto; }
  .sig-text { margin-top: 1mm; font-weight: 600; }
  .sig-creds { font-weight: 400; color: #555; font-size: ${template.fontSizePt - 1}pt; }
</style>
</head>
<body>
  <div class="sheet">
    ${sheet}
  </div>
  <script>
    // Fit-to-view for the SCREEN preview only. The print stylesheet
    // disables the transform via @media print, so actual prints land on a
    // full A4 page at the configured size.
    (function () {
      if (window.matchMedia && window.matchMedia('print').matches) return;
      var sheet = document.querySelector('.sheet');
      if (!sheet) return;
      function fit() {
        // Reset before measuring so we read the un-scaled height.
        sheet.style.transform = '';
        var vh = document.documentElement.clientHeight;
        var ch = sheet.scrollHeight;
        if (ch > vh) {
          var s = vh / ch;
          sheet.style.transform = 'scale(' + s + ')';
        }
      }
      fit();
      window.addEventListener('resize', fit);
      // Re-fit once images load (header/footer/signature/seal) since they
      // change the content height.
      Array.prototype.forEach.call(document.images, function (img) {
        if (!img.complete) img.addEventListener('load', fit);
      });
    })();
  </script>
</body>
</html>`;
}

// Triggers the browser print dialog with the prescription HTML. Uses an
// off-screen iframe so the dialog appears in the current tab — no popup, no
// blank "about:blank" window opened in the background. Chrome's window.open
// flow tended to flash a blank new tab then print from the parent, which
// confused users; iframe printing avoids that entirely.
export function openPrintWindow(html: string): void {
  fallbackIframePrint(html);
}

function fallbackIframePrint(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  const finish = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {}
    // Leave a short window before removing so the print dialog can open.
    setTimeout(() => document.body.removeChild(iframe), 1500);
  };

  const imgs = Array.from(doc.images);
  if (imgs.length === 0) {
    setTimeout(finish, 200);
    return;
  }
  let pending = imgs.length;
  const done = () => {
    pending -= 1;
    if (pending <= 0) setTimeout(finish, 100);
  };
  imgs.forEach((img) => {
    if (img.complete) done();
    else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  });
}
