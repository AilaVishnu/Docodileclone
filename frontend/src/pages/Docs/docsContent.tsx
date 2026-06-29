import React from "react";
import { Croc } from "../../components/Chat/Croc";
import { colors, fonts } from "../../styles/theme";

// The Docs library catalogue — shelves of clinic booklets. Cover art is a set
// of small flat motifs in the brand palette; the AI booklet reuses the Croc.
const ink = colors.neutral900;
const clay = colors.primary700;
const cream = colors.primary100;
const serif = fonts.family.secondary;

function CalendarPencil() {
  return (
    <svg width="92" height="78" viewBox="0 0 92 78" fill="none">
      <path d="M14 30c10 26 2 40 2 40h44c0-18 6-30 6-30" stroke={ink} strokeWidth="1.6" fill="#fff" />
      <path d="M16 70c0-10 6-22 6-40" stroke={ink} strokeWidth="1.4" />
      <path d="M30 40c8 1 18 1 28-1M28 52c10 1 22 0 32-2" stroke={ink} strokeWidth="1.2" opacity="0.7" />
      <rect x="12" y="20" width="46" height="14" rx="2" fill={clay} />
      <path d="M20 20v-6M32 20v-6M44 20v-6" stroke={ink} strokeWidth="1.6" />
      <circle cx="20" cy="11" r="4" stroke={ink} strokeWidth="1.6" /><circle cx="32" cy="11" r="4" stroke={ink} strokeWidth="1.6" /><circle cx="44" cy="11" r="4" stroke={ink} strokeWidth="1.6" />
      <path d="M24 28l2 2 4-4M36 28l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <g transform="rotate(38 70 40)"><rect x="60" y="22" width="9" height="34" rx="2" fill={colors.primary500} /><path d="M60 22h9l-4.5-9z" fill="#f4d9b0" /><path d="M62.2 18l4.6 0-2.3-4.6z" fill={ink} /></g>
    </svg>
  );
}
function Stethoscope() {
  return (
    <svg width="74" height="74" viewBox="0 0 74 74" fill="none">
      <path d="M20 12v14a14 14 0 0 0 28 0V12" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M34 54a14 14 0 0 0 28 0v-6" stroke={ink} strokeWidth="2.4" />
      <circle cx="62" cy="44" r="6" fill={colors.secondary500} stroke={ink} strokeWidth="2.2" />
      <rect x="16" y="8" width="8" height="6" rx="2" fill={clay} /><rect x="44" y="8" width="8" height="6" rx="2" fill={clay} />
    </svg>
  );
}
function People() {
  return (
    <svg width="84" height="68" viewBox="0 0 84 68" fill="none">
      <circle cx="30" cy="22" r="13" fill={clay} /><path d="M8 64c0-13 10-22 22-22s22 9 22 22" fill={clay} />
      <circle cx="56" cy="26" r="11" fill={ink} /><path d="M38 64c0-11 8-19 18-19s18 8 18 19" fill={ink} />
    </svg>
  );
}
function PillMotif() {
  return (
    <svg width="80" height="64" viewBox="0 0 80 64" fill="none">
      <g transform="rotate(-32 40 32)">
        <rect x="16" y="20" width="48" height="24" rx="12" fill={cream} stroke={ink} strokeWidth="2.2" />
        <path d="M40 20v24" stroke={ink} strokeWidth="2.2" />
        <rect x="16" y="20" width="24" height="24" rx="12" fill={colors.primary500} stroke={ink} strokeWidth="2.2" />
      </g>
    </svg>
  );
}
function Receipt() {
  return (
    <svg width="58" height="76" viewBox="0 0 58 76" fill="none">
      <path d="M10 6h38v60l-6-4-6 4-7-4-6 4-7-4V6z" fill="#fff" stroke={ink} strokeWidth="2" />
      <path d="M18 22h22M18 32h22M18 42h14" stroke={ink} strokeWidth="1.6" opacity="0.7" />
      <text x="29" y="60" textAnchor="middle" fontFamily={serif} fontSize="16" fill={clay} fontWeight="600">₹</text>
    </svg>
  );
}
function Shield() {
  return (
    <svg width="64" height="74" viewBox="0 0 64 74" fill="none">
      <path d="M32 6l24 8v18c0 18-12 28-24 34C20 60 8 50 8 32V14l24-8z" fill={colors.secondary500} stroke="#fff" strokeWidth="2.2" />
      <path d="M22 36l8 8 14-16" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DocPage() {
  return (
    <svg width="60" height="74" viewBox="0 0 60 74" fill="none">
      <path d="M12 6h26l12 12v50H12V6z" fill="#fff" stroke={ink} strokeWidth="2" /><path d="M38 6v12h12" stroke={ink} strokeWidth="2" fill="none" />
      <path d="M20 30h20M20 40h20M20 50h12" stroke={clay} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
const RxGlyph = () => <span style={{ fontFamily: serif, fontSize: 54, color: colors.primary400, fontWeight: 600, lineHeight: 1 }}>℞</span>;

export type BookletPage = { kicker: string; title: string; body: string };
export type Booklet = {
  title: string;
  kicker: string;
  bg?: string;
  fg?: string;
  accent?: string;
  art?: React.ReactNode;
  /** One-line description shown on the booklet's title page. */
  summary?: string;
  /** Inside pages, in reading order. Omitted = "still being written". */
  pages?: BookletPage[];
};
export type Shelf = { title: string; books: Booklet[] };

export const DOCS_SHELVES: Shelf[] = [
  {
    title: "Getting started",
    books: [
      {
        title: "How to book an appointment", kicker: "Guide", bg: cream, accent: clay, art: <CalendarPencil />,
        summary: "Create a booking, pick a slot and take payment — in under a minute.",
        pages: [
          { kicker: "Step 1", title: "Open the queue", body: "From Appointments, tap “New appointment” to start a fresh booking for the active doctor." },
          { kicker: "Step 2", title: "Find the patient", body: "Search by name or phone. New patient? Fill name, age and gender — it autosaves." },
          { kicker: "Step 3", title: "Pick a slot", body: "Choose the date and time. Walk-ins can skip the time and join the live queue." },
          { kicker: "Step 4", title: "Add services", body: "Attach a consultation or procedure — the live bill totals as you go." },
          { kicker: "Step 5", title: "Take payment", body: "Book & pay now, or “Book now, pay later” to keep the bill open." },
        ],
      },
      { title: "Set up your clinic", kicker: "Guide", bg: colors.primary200, accent: colors.secondary600, art: <Stethoscope /> },
      { title: "Invite your team", kicker: "Guide", bg: colors.primary300, accent: clay, art: <People /> },
    ],
  },
  {
    title: "Everyday guides",
    books: [
      { title: "Writing prescriptions", kicker: "How-to", bg: ink, fg: cream, accent: colors.primary400, art: <RxGlyph /> },
      { title: "Pharmacy & stock", kicker: "How-to", bg: cream, accent: colors.primary600, art: <PillMotif /> },
      { title: "Bills & payments", kicker: "How-to", bg: colors.primary200, accent: clay, art: <Receipt /> },
      { title: "Meet Croc, your assistant", kicker: "New", bg: colors.primary300, accent: colors.secondary600, art: <Croc size={64} /> },
    ],
  },
  {
    title: "Policies",
    books: [
      { title: "Patient privacy", kicker: "Policy", bg: ink, fg: cream, accent: colors.secondary500, art: <Shield /> },
      { title: "Data & consent", kicker: "Policy", bg: cream, accent: colors.primary600, art: <DocPage /> },
    ],
  },
];
