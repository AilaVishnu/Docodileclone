import React from "react";
import { ProcedureCard, emptyProcedure } from "../components/ProcedureCard";
import { TextBlock, emptyText } from "./blocks/TextBlock";
import { HistoryBlock, emptyHistory } from "./blocks/HistoryBlock";
import { VitalsBlock, emptyVitals } from "./blocks/VitalsBlock";
import { RxBlock, type RxRow, type RxThenRow } from "./blocks/RxBlock";
import { ComplaintsBlock, DiagnosisBlock, TestsBlock, emptyTags } from "./blocks/TagsBlock";
import { NotesBlock, emptyNotes } from "./blocks/NotesBlock";
import { ReferBlock } from "./blocks/ReferBlock";
import { ReviewBlock } from "./blocks/ReviewBlock";
import { useReferralDoctors } from "../hooks/useReferralDoctors";
import type { BlockComponentProps, BlockDefinition } from "./block";

// ─────────────────────────────────────────────────────────────────────────────
// Block registry — the single map of block `type` → its body component + chrome
// metadata (title, icon, bento width, surface, repeatable). The VisitForm reads
// this to render each block. Adding a block to the product is one entry.
//
// Most block bodies are controlled `{value, onChange}` components. A few blocks
// (Rx, Refer, Review) were extracted from PrescriptionPage with the page's real
// wired signatures — they take page state + callbacks, not a single value. The
// registry wraps those in thin `{value, onChange}` adapters below so the
// composition foundation (VisitForm / templates) keeps a uniform contract while
// the page keeps rendering the real blocks directly with its own state.
// ─────────────────────────────────────────────────────────────────────────────

// ── Rx adapter ──────────────────────────────────────────────────────────────
export type RxData = { rows: RxRow[] };
const blankRxRow = (position: number): RxRow => ({
  id: null, position, medicine: "", genericName: "", medicineNote: "", dosage: "",
  whenToTake: "", frequency: "", frequencyInterval: "", duration: "", notes: "", thenRows: [],
});
const blankThen = (): RxThenRow => ({ dosage: "", whenToTake: "", frequency: "", frequencyInterval: "", duration: "", notes: "" });
export const emptyRx = (): RxData => ({ rows: [blankRxRow(1)] });
// Keep exactly one trailing empty row — mirrors the page's withTrailingRx.
const withTrailing = (rows: RxRow[]): RxRow[] => {
  const filled = rows.filter((r) => r.medicine.trim() !== "");
  const empty = rows.find((r) => r.medicine.trim() === "");
  return [...filled, empty ?? blankRxRow(0)].map((r, i) => ({ ...r, position: i + 1 }));
};

function RxAdapter({ value, onChange }: BlockComponentProps<RxData>) {
  const rows = value.rows;
  const commit = (next: RxRow[]) => onChange({ rows: withTrailing(next) });
  const patch = (i: number, p: Partial<RxRow>) => commit(rows.map((r, ix) => (ix === i ? { ...r, ...p } : r)));
  return (
    <RxBlock
      rows={rows}
      interactions={[]}
      onUpdateField={(i, key, v) => patch(i, { [key]: v } as Partial<RxRow>)}
      onMedicineChange={(i, v) => patch(i, { medicine: v, genericName: "" })}
      onMedicineSelect={(i, name, genericName) => patch(i, { medicine: name, genericName })}
      onAddThenRow={(i) => patch(i, { thenRows: [...rows[i].thenRows, blankThen()] })}
      onRemoveRxRow={(i) => commit(rows.filter((_, ix) => ix !== i))}
      onUpdateThenField={(i, ti, key, v) => patch(i, { thenRows: rows[i].thenRows.map((t, tx) => (tx === ti ? { ...t, [key]: v } : t)) })}
      onRemoveThenRow={(i, ti) => patch(i, { thenRows: rows[i].thenRows.filter((_, tx) => tx !== ti) })}
    />
  );
}

// ── Refer adapter ───────────────────────────────────────────────────────────
export type ReferData = { referredBy: string | null };
export const emptyRefer = (): ReferData => ({ referredBy: null });

function ReferAdapter({ value, onChange }: BlockComponentProps<ReferData>) {
  const referralDoctors = useReferralDoctors();
  return <ReferBlock options={referralDoctors} value={value.referredBy} onChange={(name) => onChange({ referredBy: name })} />;
}

// ── Review adapter ──────────────────────────────────────────────────────────
export type ReviewData = { date: Date | null; days: string; notes: string };
export const emptyReview = (): ReviewData => ({ date: null, days: "", notes: "" });
const daysBetween = (d: Date): number => Math.max(0, Math.round((d.getTime() - Date.now()) / 86400000));
const dateAfter = (days: number): Date => { const t = new Date(); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() + days); return t; };

function ReviewAdapter({ value, onChange }: BlockComponentProps<ReviewData>) {
  return (
    <ReviewBlock
      date={value.date}
      days={value.days}
      notes={value.notes}
      onPickDate={(d) => onChange({ ...value, date: d, days: String(daysBetween(d)) })}
      onDaysChange={(raw) => {
        const cleaned = raw.replace(/\D/g, "");
        onChange({ ...value, days: cleaned, date: cleaned === "" ? null : dateAfter(parseInt(cleaned, 10)) });
      }}
      onNotesChange={(notes) => onChange({ ...value, notes })}
    />
  );
}

export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  vitals:          { type: "vitals",          title: "Vitals",            icon: "heart-pulse",     width: "full", surface: "card", Component: VitalsBlock,  makeEmpty: emptyVitals },
  complaints:      { type: "complaints",      title: "Complaints",        icon: "chat-dots",       width: "half", surface: "card", menu: true, Component: ComplaintsBlock, makeEmpty: emptyTags },
  diagnosis:       { type: "diagnosis",       title: "Diagnosis",         icon: "stethoscope",     width: "half", surface: "card", menu: true, Component: DiagnosisBlock,  makeEmpty: emptyTags },
  history:         { type: "history",         title: "History",           icon: "history",         width: "full", surface: "card", Component: HistoryBlock, makeEmpty: emptyHistory },
  rx:              { type: "rx",              title: "Rx",                icon: "prescription",    width: "full", surface: "card", menu: true, Component: RxAdapter,      makeEmpty: emptyRx },
  procedure:       { type: "procedure",       title: "Procedure",         icon: "pulse",           width: "full", surface: "card", repeatable: true, Component: ProcedureCard, makeEmpty: emptyProcedure },
  notesForPatient: { type: "notesForPatient", title: "Notes for patient", icon: "pen",             width: "half", surface: "card", menu: true, Component: NotesBlock,     makeEmpty: emptyNotes },
  privateNotes:    { type: "privateNotes",    title: "Private notes",     icon: "eye-closed",      width: "half", surface: "card", menu: true, Component: TextBlock,      makeEmpty: emptyText },
  tests:           { type: "tests",           title: "Tests",             icon: "file",            width: "full", surface: "card", Component: TestsBlock,     makeEmpty: emptyTags },
  refer:           { type: "refer",           title: "Refer to",          icon: "staff",           width: "full", surface: "card", Component: ReferAdapter,  makeEmpty: emptyRefer },
  review:          { type: "review",          title: "Review",            icon: "calendar-check",  width: "full", surface: "card", Component: ReviewAdapter, makeEmpty: emptyReview },
};

/** Look up a block definition by type (undefined if not registered). */
export const getBlock = (type: string): BlockDefinition | undefined => BLOCK_REGISTRY[type];

/** All registered blocks — e.g. to populate an "add block" menu. */
export const listBlocks = (): BlockDefinition[] => Object.values(BLOCK_REGISTRY);
