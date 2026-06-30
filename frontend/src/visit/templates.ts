// ─────────────────────────────────────────────────────────────────────────────
// Visit templates — a specialty's DEFAULT visit form, expressed as data (an
// ordered list of blocks), not code. The doctor can add / remove / reorder from
// this default per visit. Clinics can later have their own templates (derm,
// cardio, ortho, dental…) and eventually edit them in a builder UI — all of
// which is possible because a template is just config over the block registry.
// Every `type` here must match a key in BLOCK_REGISTRY.
// ─────────────────────────────────────────────────────────────────────────────

/** One block instance in a template (or a live visit). */
export type BlockSpec = {
  /** References a BlockDefinition.type in the registry. */
  type: string;
  /** Unique within a visit — lets the same type repeat (e.g. two Procedures). */
  instanceId: string;
  /** Optional per-instance title override (else the registry title is used). */
  title?: string;
};

/** A specialty's default visit form. */
export type VisitTemplate = {
  id: string;
  name: string;
  specialty?: string;
  blocks: BlockSpec[];
};

/** The general consultation flow. */
export const GENERAL_TEMPLATE: VisitTemplate = {
  id: "general",
  name: "General consultation",
  blocks: [
    { type: "vitals", instanceId: "vitals" },
    { type: "complaints", instanceId: "complaints" },
    { type: "diagnosis", instanceId: "diagnosis" },
    { type: "history", instanceId: "history" },
    { type: "rx", instanceId: "rx" },
    { type: "notesForPatient", instanceId: "notesForPatient" },
    { type: "privateNotes", instanceId: "privateNotes" },
    { type: "tests", instanceId: "tests" },
    { type: "refer", instanceId: "refer" },
    { type: "review", instanceId: "review" },
  ],
};

/** Dermatology — the consult flow with a Procedure block. */
export const DERM_TEMPLATE: VisitTemplate = {
  id: "derm",
  name: "Dermatology",
  specialty: "Dermatology",
  blocks: [
    { type: "vitals", instanceId: "vitals" },
    { type: "complaints", instanceId: "complaints" },
    { type: "diagnosis", instanceId: "diagnosis" },
    { type: "history", instanceId: "history" },
    { type: "rx", instanceId: "rx" },
    { type: "procedure", instanceId: "procedure-1" },
    { type: "notesForPatient", instanceId: "notesForPatient" },
    { type: "privateNotes", instanceId: "privateNotes" },
    { type: "tests", instanceId: "tests" },
    { type: "refer", instanceId: "refer" },
    { type: "review", instanceId: "review" },
  ],
};

export const VISIT_TEMPLATES: VisitTemplate[] = [GENERAL_TEMPLATE, DERM_TEMPLATE];
