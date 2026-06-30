import { ProcedureCard, emptyProcedure } from "../components/ProcedureCard";
import { TextBlock, emptyText } from "./blocks/TextBlock";
import { HistoryBlock, emptyHistory } from "./blocks/HistoryBlock";
import { VitalsBlock, emptyVitals } from "./blocks/VitalsBlock";
import { RxBlock, emptyRx } from "./blocks/RxBlock";
import { ComplaintsBlock, DiagnosisBlock, TestsBlock, emptyTags } from "./blocks/TagsBlock";
import { NotesBlock, emptyNotes } from "./blocks/NotesBlock";
import { ReferBlock, emptyRefer } from "./blocks/ReferBlock";
import { ReviewBlock, emptyReview } from "./blocks/ReviewBlock";
import type { BlockDefinition } from "./block";

// ─────────────────────────────────────────────────────────────────────────────
// Block registry — the single map of block `type` → its body component + chrome
// metadata (title, icon, bento width, surface, repeatable). The VisitForm reads
// this to render each block. Adding a block to the product is one entry.
//
// PHASE STATUS: `procedure` is a real, built block. The consult sections below
// are registered with `SectionStub` as a placeholder body — the title / icon /
// width / surface are real, so the bento layout is correct; only the body is a
// stub. Building a section = swap its `Component` from SectionStub to the real
// body. (Icons for the consult sections are best-available; `procedure` has no
// dedicated glyph yet — `pulse` is a placeholder, flagged.)
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  vitals:          { type: "vitals",          title: "Vitals",            icon: "heart-pulse",     width: "full", surface: "card", Component: VitalsBlock,  makeEmpty: emptyVitals },
  complaints:      { type: "complaints",      title: "Complaints",        icon: "chat-dots",       width: "half", surface: "card", menu: true, Component: ComplaintsBlock, makeEmpty: emptyTags },
  diagnosis:       { type: "diagnosis",       title: "Diagnosis",         icon: "stethoscope",     width: "half", surface: "card", menu: true, Component: DiagnosisBlock,  makeEmpty: emptyTags },
  history:         { type: "history",         title: "History",           icon: "history",         width: "full", surface: "card", Component: HistoryBlock, makeEmpty: emptyHistory },
  rx:              { type: "rx",              title: "Rx",                icon: "prescription",    width: "full", surface: "card", menu: true, Component: RxBlock,        makeEmpty: emptyRx },
  procedure:       { type: "procedure",       title: "Procedure",         icon: "pulse",           width: "full", surface: "card", repeatable: true, Component: ProcedureCard, makeEmpty: emptyProcedure },
  notesForPatient: { type: "notesForPatient", title: "Notes for patient", icon: "pen",             width: "half", surface: "card", menu: true, Component: NotesBlock,     makeEmpty: emptyNotes },
  privateNotes:    { type: "privateNotes",    title: "Private notes",     icon: "eye-closed",      width: "half", surface: "card", menu: true, Component: TextBlock,      makeEmpty: emptyText },
  tests:           { type: "tests",           title: "Tests",             icon: "file",            width: "full", surface: "card", Component: TestsBlock,     makeEmpty: emptyTags },
  refer:           { type: "refer",           title: "Refer to",          icon: "staff",           width: "full", surface: "card", Component: ReferBlock,   makeEmpty: emptyRefer },
  review:          { type: "review",          title: "Review",            icon: "calendar-check",  width: "full", surface: "card", Component: ReviewBlock,  makeEmpty: emptyReview },
};

/** Look up a block definition by type (undefined if not registered). */
export const getBlock = (type: string): BlockDefinition | undefined => BLOCK_REGISTRY[type];

/** All registered blocks — e.g. to populate an "add block" menu. */
export const listBlocks = (): BlockDefinition[] => Object.values(BLOCK_REGISTRY);
