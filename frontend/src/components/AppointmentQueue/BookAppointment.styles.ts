import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes, fluidSpacing, layout } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// BOOK APPOINTMENT — styles
//
// Responsive behavior (see theme.ts comment block for the full system rules):
//   • Outer overlay padding is FLUID (grows from 24→32 vertical, 40→56 horizontal
//     between viewport 1440 and 2560).
//   • 3-column grid is FIXED at design sizes (200 / 524-700 / 312) with
//     justify-content: center — extra viewport space becomes outer gutter.
//   • Form column has minmax(524, 700) so input surface grows modestly on
//     larger screens (useful density for data entry); other cards stay fixed.
//   • Card internal padding / gap / radius / stroke are STATIC (tokens).
//   • Buttons hug content but retain a minWidth to preserve visual pairing
//     between "Book now Pay later" and "Pay & Book" per design.
//
// All off-grid human-error values (6, 10, 12x20, 28px, 32px radius) snapped
// to the nearest Figma token on the 2/4/8/12/16/20/24/32/40 ladder.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  // ─── Outer shell ──────────────────────────────────────────────────────────
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.active.shade200,
    zIndex: 2000,
    // No TOP padding: the sticky <PageHeader/> is the first child and must hug
    // the very top (touching the TopNav). Its own internal padding provides the
    // header's breathing room; the flex gap below spaces it from the grid.
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    // Top-left radius where content meets sidebar. Design shows a large curve;
    // using 2xl (16) since 32 isn't on the Figma radius ladder. Ask design if
    // they want radii["3xl"] added for this.
    borderRadius: `${radii["2xl"]}px 0 0 0`,
    // When the form grows beyond the viewport (e.g. many services), THIS block
    // scrolls vertically — the TopNav and sidebar (outside the overlay) stay
    // fixed. Never scrolls horizontally.
    overflowY: "auto",
    overflowX: "hidden",
  },

  // ─── Header ──────────────────────────────────────────────────────────────
  // Moved to the shared <PageHeader/> component (components/PageHeader). The
  // old inline header / backButton / title styles were removed when this page
  // adopted the sticky app-bar.

  // ─── Main 3-column grid ──────────────────────────────────────────────────
  grid: {
    display: "grid",
    // patient | form | bill — all FIXED widths so the block is a constant size
    // per tier; the side gutters absorb the extra width (justify-content center
    // + margin auto). Columns tighten in the 1200–1439 tier via globals.css.
    gridTemplateColumns: "var(--book-col-left) var(--book-col-form) var(--book-col-right)",
    gridTemplateRows: "auto auto auto",
    gap: "var(--book-grid-gap, 16px)",
    justifyContent: "center",
    alignItems: "stretch",
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    marginLeft: "auto",
    marginRight: "auto",
  },

  // ─── Card base ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    border: `${strokes.xs} solid ${colors.neutral100}`,
    boxSizing: "border-box",
    width: "100%",
  },

  // ─── Left column: Patient ID card + schedule chips ───────────────────────
  patientIdCard: {
    gridColumn: "1",
    gridRow: "1",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--book-patient-pad, 16px)",
    gap: "var(--book-patient-gap, 12px)",
  },
  scheduleColumn: {
    gridColumn: "1",
    gridRow: "2",
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    alignSelf: "start",
  },
  // Schedule mini chips (date / time pills under patient card)
  // Design spec: padding 8/16, height 40, radius 8.
  // Was 6/12 — off-grid, snapped to design.
  scheduleMiniCard: {
    padding: `${spacing.xs} ${spacing.m}`,
    height: "unset",
    minHeight: "40px",
    justifyContent: "center",
  },
  patientIdText: {
    fontSize: fonts.size.h2,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    margin: 0,
  },
  // Avatar illustration shown above the Patient ID — Figma 2350:52.
  // Picked by gender + age band; updates as the user fills the form.
  patientAvatar: {
    width: "var(--book-patient-avatar, 140px)",
    height: "var(--book-patient-avatar, 140px)",
    objectFit: "contain" as const,
    display: "block",
  },

  // ─── Center column: Form card + Appointment details card ────────────────
  // Form card — Figma: padding 16/24, gap 16
  formCard: {
    gridColumn: "2",
    gridRow: "1",
    gap: spacing.m,
    // Bottom padding var-driven so 1024 trims the space under male/female.
    padding: `${spacing.m} ${spacing.xl} var(--book-form-pad-bottom, 16px) ${spacing.xl}`,
  },

  // Appointment details — Figma: padding 24/24/24/16 (asymmetric left), gap 16
  // Was 12/20 — snapped to design.
  appointmentDetailsCard: {
    gridColumn: "2",
    gridRow: "2",
    // Inter-row gap + top/bottom padding var-driven so 1024 compresses the
    // doctor/service rhythm without touching the left/right asymmetry.
    gap: "var(--book-details-gap, 16px)",
    padding: `var(--book-details-pad-y, 24px) ${spacing.xl} var(--book-details-pad-y, 24px) ${spacing.m}`,
    justifyContent: "center",
    alignSelf: "start",
    minHeight: "144px",
    boxSizing: "border-box",
  },
  appointmentRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    width: "100%",
  },
  appointmentLabelGroup: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    width: "140px",
    flexShrink: 0,
  },
  appointmentIcon: {
    color: colors.neutral900,
    width: "24px",
    height: "24px",
  },

  // ─── Right column: Bill card (spans 2 rows) ──────────────────────────────
  // Figma: padding 2/24 (tight top/bottom — decorative edges handle the rest),
  // gap 12, radius 8. Was 12/20 — snapped.
  billingCard: {
    gridColumn: "3",
    gridRow: "1 / span 2",
    gap: spacing.s,
    padding: `${spacing["3xs"]} ${spacing.xl}`,
    height: "fit-content",
    alignSelf: "start",
  },
  billingTitle: {
    margin: 0,
    fontSize: fonts.size.l,
    textAlign: "center",
    width: "100%",
    color: colors.neutral900,
  },
  billingRowInline: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    width: "100%",
  },
  billingLabel: {
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium,
    color: colors.neutral500, // was neutral700 — same UI-grey rule
    width: "80px",
    flexShrink: 0,
  },
  billingValueArea: {
    flex: 1,
    borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
    paddingBottom: spacing["2xs"],
    display: "flex",
    alignItems: "center",
  },
  billingValue: {
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  totalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.m,
    borderTop: `${strokes.xs} solid ${colors.neutral200}`,
    fontSize: fonts.size.l,
    fontWeight: fonts.weight.bold,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: colors.neutral900,
  },

  // ─── Form controls (shared) ──────────────────────────────────────────────
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
  },
  fieldLabel: {
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  iconField: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    // Horizontal padding fixed; vertical via var so 1024 can flatten the row.
    padding: `var(--book-input-pady) ${spacing.xs}`,
    borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
    width: "100%",
  },
  iconFieldIcon: {
    color: colors.neutral900,
    width: "24px",
    height: "24px",
    flexShrink: 0,
  },
  // Inline label for a FIELD NAME (e.g. "DOB", "Age") — slightly heavier so
  // it reads as "this is what the field captures".
  inlineFieldLabel: {
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  // Inline label for a UNIT next to an input (e.g. "years", "months") —
  // smaller + regular weight so it reads as a secondary annotation.
  inlineUnitLabel: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.regular,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  iconFieldInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: fonts.size.m,
    color: colors.neutral900,
    backgroundColor: "transparent",
    padding: 0,
    fontFamily: fonts.family.primary,
  },
  input: {
    width: "100%",
    padding: `var(--book-input-pady) ${spacing.s}`,
    borderRadius: radii.m,
    border: `${strokes.xs} solid ${colors.neutral300}`,
    fontSize: fonts.size.m,
    outline: "none",
    transition: "border-color 0.2s",
  },
  borderlessInput: {
    border: "none",
    outline: "none",
    fontSize: fonts.size.m,
    color: colors.neutral900,
    backgroundColor: "transparent",
    padding: 0,
    width: "100%",
    fontFamily: fonts.family.primary,
  },
  row: {
    display: "flex",
    gap: spacing.m,
    alignItems: "center",
    width: "100%",
  },
  radioGroup: {
    display: "flex",
    gap: spacing.m,
  },
  radioGroupInline: {
    display: "flex",
    gap: spacing.s,
    flexWrap: "nowrap",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"], // was 6px — snapped to 4
    fontSize: fonts.size.m,
    cursor: "pointer",
    color: colors.neutral900,
  },
  radioLabelSmall: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    fontSize: fonts.size.s,
    cursor: "pointer",
    color: colors.neutral900,
    whiteSpace: "nowrap",
  },
  select: {
    width: "100%",
    padding: `var(--book-input-pady) ${spacing.s}`,
    borderRadius: radii.m,
    border: `${strokes.xs} solid ${colors.neutral300}`,
    fontSize: fonts.size.m,
    backgroundColor: colors.active.shade50,
    cursor: "pointer",
  },

  // ─── Footer pill buttons ─────────────────────────────────────────────────
  // Design spec: padding 8/16, radius full (999), height 40.
  // Was 10/28 — off-grid, snapped.
  // minWidth retained at 200 to preserve visual pairing between paired buttons
  // per design intent — without it, shorter-text buttons look unbalanced.
  footerButtonGroup: {
    gridRow: "3",
    gridColumn: "1 / -1",
    display: "flex",
    gap: spacing.m,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "var(--book-footer-mt, 16px)",
    width: "100%",
  },
  pillButtonPrimary: {
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    borderRadius: radii.full,
    padding: `${spacing.xs} ${spacing.m}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    cursor: "pointer",
    border: `${strokes.s} solid ${colors.neutral900}`,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.primary,
    minWidth: "200px",
    boxSizing: "border-box",
  },
  pillButtonSecondary: {
    backgroundColor: "transparent",
    color: colors.neutral900,
    borderRadius: radii.full,
    padding: `${spacing.xs} ${spacing.m}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    cursor: "pointer",
    border: `${strokes.s} solid ${colors.neutral900}`,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.primary,
    minWidth: "200px",
    boxSizing: "border-box",
  },
  pillButtonPayDue: {
    backgroundColor: colors.secondary500,
    color: colors.neutral100,
    borderRadius: radii.full,
    padding: `${spacing.xs} ${spacing.m}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    cursor: "pointer",
    border: "none",
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.primary,
    minWidth: "200px",
    boxSizing: "border-box",
  },
};
