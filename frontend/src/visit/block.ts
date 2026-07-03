import type { ComponentType } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Visit blocks — the modular foundation for the prescription/visit form.
//
// A Visit is a stack of Blocks. A Block is a self-contained section (Vitals, Rx,
// Procedure…). This file is the contract every block + the registry obey, so a
// visit can be composed from a Template (data) instead of a hardcoded page — and
// a doctor can add / remove / reorder blocks per visit, and clinics can later
// have specialty templates (derm / cardio / ortho / dental) that are just config.
//
// Split of responsibility:
//   • <SectionBlock>  owns the CHROME  — header (icon + title + collapse + kebab),
//                     remove action, surface, divider.
//   • a block Component owns the BODY  — its own fields, its own data shape.
// That's what makes any block "just another block": uniform chrome, swappable body.
// ─────────────────────────────────────────────────────────────────────────────

export type BlockMode = "edit" | "print";

/** Every block body is controlled — the Visit owns the data. `mode` lets the
 *  same block render its editor (Rx pad) or its read-only/print view (the PDF). */
export type BlockComponentProps<T = unknown> = {
  value: T;
  onChange: (next: T) => void;
  mode?: BlockMode;
};

/** Full-width block, or a half that pairs with the next half on one row
 *  (e.g. Complaints │ Diagnosis). The renderer flows two consecutive halves. */
export type BlockWidth = "full" | "half";

/** A block's visual surface: a flush section divider-separated inside the visit
 *  sheet (the default, matching the consult sections), or a distinct card that
 *  stands out (e.g. Procedure). */
export type BlockSurface = "flush" | "card";

/** Registry entry — maps a block `type` to its body component + chrome metadata. */
export type BlockDefinition<T = any> = {
  type: string;
  /** Title for the SectionBlock header + the "add block" menu. */
  title: string;
  /** Icon name from the <Icon> registry (never a raw svg). */
  icon: string;
  width: BlockWidth;
  surface?: BlockSurface;
  /** Can a visit hold more than one (e.g. Procedure)? */
  repeatable?: boolean;
  /** Show a kebab menu in the header (e.g. "Save as template"). */
  menu?: boolean;
  /** The body component — receives this block's data slice. */
  Component: ComponentType<BlockComponentProps<T>>;
  /** Fresh blank data for a new instance. */
  makeEmpty: () => T;
};
