import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes, fluidSpacing, shadows, zIndex } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Prescription page — baseline scaffold per Figma node 2057:6224
// Two-column layout: patient/context pane on the left (246px fixed),
// visit-form area on the right (grows).
// All sections rendered as Cards to match the existing design system.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  // Acts as its OWN scroll container (mirroring AppointmentQueue.container
   // and PrescriptionQueue.page) so the sticky <PageHeader/> can hug the very
   // top of main. paddingBottom 80 reserves room for the floating SessionBar.
  page: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    // Extra bottom room so the two stacked floating bars (session pill +
    // the nav/actions bar) never cover the last form rows.
    padding: `0 ${fluidSpacing.outerX} 160px`,
    overflowY: "auto",
    overflowX: "hidden",
  },

  // Inner tabs ("All" / "Reports" / "Files") for the Files view — matches the
  // Rx Pad home filter-pill style (PrescriptionQueue.styles.tab), including
  // the tier-responsive --rxq-tab-padx variable for horizontal padding.
  // Sized to match the visit chips (height 32, compact pill) for consistency.
  listTab: {
    height: 32,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.m,
    border: "none",
    backgroundColor: colors.alphaBlack0,
    color: colors.alphaBlack3,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  listTabActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },

  // (Old inline header grid — no longer used; <PageHeader/> took over.
   // Left here in case anything still references the styles.header key.)
  header: {
    display: "grid",
    gridTemplateColumns: "246px minmax(0, 1fr)",
    gap: spacing.m,
    alignItems: "start",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
  },
  headerRight: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.m,
  },
  headerTitleGroup: {
    flex: 1,
    textAlign: "left" as const,
  },
  // Figma node 2057:6739 — Linear/Arrows/Arrow Left back button.
  // No circle border per the design — just the icon, neutral900.
  backButton: {
    width: 32,
    height: 32,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
    marginTop: spacing["2xs"],
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  subtitle: {
    margin: 0,
    marginTop: spacing["2xs"],
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },
  // Single column — the section nav + contact actions live in a floating
  // bottom bar now, so the form spans the FULL content width. Page
  // responsiveness = the form stretching / squeezing.
  // Form content is capped at a fixed --rx-content-max and centered; the
  // page's horizontal padding + these auto margins are the stretchy gutters
  // (wide at 1440+, squeezing toward the 1200 floor).
  body: {
    display: "block",
    width: "100%",
    maxWidth: "var(--rx-content-max)",
    marginLeft: "auto",
    marginRight: "auto",
  },

  // ── Left column ──────────────────────────────────────────────────────────
  // Slim icon rail — sticks below the sticky header while the long form
  // scrolls, so Visits / Files / Timeline / Bills stay reachable.
  leftColumn: {
    position: "sticky" as const,
    top: spacing.m,
    alignSelf: "start" as const,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },

  // ── Icon rail (Figma-adjacent; mirrors the app's main 80px sidebar) ──────
  iconNav: {
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    display: "flex",
    flexDirection: "column",
    gap: spacing["3xs"],
  },
  railItem: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3xs"],
    padding: `${spacing.xs} ${spacing["2xs"]}`,
    borderRadius: radii.s,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    cursor: "pointer",
    width: "100%",
    minHeight: 56,
  },
  railItemActive: {
    backgroundColor: colors.primary700,
    color: colors.neutral100,
  },
  railIconWrap: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  railLabel: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontFamily: fonts.family.primary,
    color: "inherit",
    textAlign: "center" as const,
  },
  // Count badge — small pill anchored to the top-right of the rail icon.
  railBadge: {
    position: "absolute" as const,
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary200,
    color: colors.neutral700,
    fontSize: 10,
    lineHeight: "16px",
    fontFamily: fonts.family.primary,
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
  },
  railBadgeActive: {
    backgroundColor: colors.primary100,
    color: colors.primary700,
  },

  // AI Summary trigger — a ✨ button in the rail; opens the popover panel.
  railAiBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3xs"],
    padding: `${spacing.xs} ${spacing["2xs"]}`,
    borderRadius: radii.m,
    border: `${strokes.xs} solid ${colors.primary300}`,
    backgroundColor: colors.primary100,
    color: colors.neutral900,
    cursor: "pointer",
    width: "100%",
    minHeight: 56,
  },
  railAiBtnActive: {
    borderColor: colors.primary500,
  },

  // AI Summary popover — floats above the bottom bar, near the ✨ button.
  aiPopover: {
    position: "fixed" as const,
    bottom: 84,
    right: fluidSpacing.outerX,
    width: 320,
    maxHeight: 360,
    overflowY: "auto" as const,
    backgroundColor: colors.neutral100,
    borderRadius: radii.l,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    zIndex: 1200,
  },
  aiPopoverBackdrop: {
    position: "fixed" as const,
    inset: 0,
    zIndex: 1199,
  },

  // ── Header patient identity (centered in the sticky bar) ─────────────────
  // ── Bespoke single-row sticky header (replaces the shared PageHeader on this
  // page). Full-bleed bar; inner caps at --rx-content-max and centers, so its
  // content edge-aligns with the prescription form below. ~half the old height.
  rxHeader: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    // Shared header chrome — see globals.css --header-* (matches PageHeader).
    backgroundColor: "var(--header-bg)",
    borderBottom: "1px solid var(--header-border)",
    // Full-bleed: cancel the page's horizontal padding so the bar paints
    // edge-to-edge; the inner re-centers content at the form width.
    marginLeft: `calc(-1 * ${fluidSpacing.outerX})`,
    marginRight: `calc(-1 * ${fluidSpacing.outerX})`,
    borderRadius: `${radii["2xl"]}px 0 0 0`,
    boxSizing: "border-box",
  },
  // Horizontal-padding wrapper — recreates the page's outer gutter so the inner
  // (capped at the form width) centers within the SAME box as the form below,
  // keeping the avatar edge-aligned to the form at every width (incl. 1200).
  rxHeaderPad: {
    width: "100%",
    paddingLeft: fluidSpacing.outerX,
    paddingRight: fluidSpacing.outerX,
    boxSizing: "border-box",
  },
  rxHeaderInner: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    width: "100%",
    maxWidth: "var(--rx-content-max)",
    marginLeft: "auto",
    marginRight: "auto",
    minHeight: "var(--header-h)",
    paddingTop: "var(--header-pad-y)",
    paddingBottom: "var(--header-pad-y)",
    boxSizing: "border-box",
  },
  // Back arrow pinned in the left gutter (absolute → outside the inner flow),
  // so the avatar is the first inner element and aligns to the form edge.
  rxBackBtn: {
    position: "absolute",
    left: "var(--header-back-inset)",
    top: 0,
    bottom: 0,
    width: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    padding: 0,
  },
  rxHeaderSpacer: {
    flex: 1,
    minWidth: spacing.s,
  },

  headerPatient: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    flexShrink: 0,
  },
  // Patient name only (no avatar / T-number / meta) — sans (Inter) at the CTA
  // font size, like the other header titles. LEFT-aligned (the prescription-
  // file exception).
  headerName: {
    fontSize: "var(--btn-fs)",
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
  },

  // Print / Download / Share — icon-only actions in the sticky PageHeader's
  // right slot (moved here from the floating SessionBar).
  headerActionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    padding: 0,
    background: "transparent",
    border: "none",
    borderRadius: radii.m,
    cursor: "pointer",
    color: colors.neutral700,
  },
  // Leading icon inside each contact-kebab menu item ([phone] +91…, etc.).
  kebabItemIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
    color: "currentColor",
  },
  // Three-dot contact kebab trigger sitting in the header actions slot.
  kebabTrigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    fontSize: 22,
    lineHeight: 1,
    color: colors.neutral700,
  },

  // ── Header stack: identity row on top, section nav below ─────────────────
  // The header center cell now carries two rows; both stay centered.
  headerStack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 0,
  },
  // Section nav (Visits / Files / Timeline / Bills) — full-height underline
  // tabs. Stretched to the bar's full height (cancelling the inner's vertical
  // padding) so the active underline lands flush on the header's bottom edge.
  headerSectionNav: {
    display: "flex",
    alignItems: "stretch",
    alignSelf: "stretch",
    gap: spacing.m,
    flexWrap: "nowrap",
    marginTop: "calc(-1 * var(--header-pad-y))",
    marginBottom: "calc(-1 * var(--header-pad-y))",
  },
  // Underline tabs: every section shows icon + label; the active tab carries a
  // peach underline flush with the header's bottom edge (full-height tab).
  headerSectionTab: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: "100%",
    padding: `0 ${spacing["2xs"]}`,
    border: "none",
    // Underline via inset boxShadow (sits at the very bottom of the full-height
    // tab) — avoids the border shorthand/longhand mix warning.
    boxShadow: "inset 0 -2px 0 transparent",
    backgroundColor: "transparent",
    color: colors.neutral600,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },
  // Active = peach underline + peach label, slightly bolder.
  headerSectionTabActive: {
    color: colors.primary700,
    fontWeight: fonts.weight.medium,
    boxShadow: `inset 0 -2px 0 ${colors.active.shade600}`,
  },
  headerSectionIcon: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Small peach dot on an inactive icon-only tab when that section has a count
  // (e.g. Files · 1). Ringed in the header tint so it reads as a badge.
  headerSectionDot: {
    position: "absolute",
    top: -1,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: radii.full,
    backgroundColor: colors.active.shade600,
    border: "1.5px solid var(--header-bg)",
    boxSizing: "border-box",
  },
  // Count badge — light tint with dark-peach text (sits beside the label).
  headerSectionBadge: {
    minWidth: 18,
    height: 18,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: radii.full,
    backgroundColor: colors.primary200,
    color: colors.primary700,
    fontSize: 11,
    lineHeight: "18px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  headerSectionBadgeActive: {
    backgroundColor: colors.primary100,
    color: colors.primary700,
  },

  // ── Floating bottom bar — section nav (left) + contact actions (right) ───
  // Mirrors the SessionBar's centered-floating-pill treatment. Sits stacked
  // just below the (lifted) session pill.
  bottomBar: {
    position: "fixed" as const,
    bottom: spacing.l,
    // Viewport-centered, matching the SessionBar so the two pills align.
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    padding: `${spacing["2xs"]} ${spacing.s}`,
    zIndex: 1090,
  },
  // Per-section action buttons inside the floating bar (Download / Print /
  // Share / Clear all for Visits). Output actions group together; Clear all
  // gets the danger tint + a divider so it never sits flush with them.
  barBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    height: 36,
    padding: `0 ${spacing.s}`,
    borderRadius: radii.m,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    whiteSpace: "nowrap",
  },
  barBtnDanger: {
    color: colors.red200,
  },
  barDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.neutral200,
    margin: `${spacing["2xs"]} ${spacing["2xs"]}`,
  },
  bottomNav: {
    display: "flex",
    alignItems: "center",
    gap: spacing["3xs"],
  },
  bottomNavItem: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.s}`,
    borderRadius: radii.m,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    whiteSpace: "nowrap" as const,
  },
  bottomNavItemActive: {
    backgroundColor: colors.primary700,
    color: colors.neutral100,
  },
  bottomNavBadge: {
    minWidth: 18,
    height: 18,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: radii.full,
    backgroundColor: colors.primary200,
    color: colors.neutral700,
    fontSize: 11,
    lineHeight: "18px",
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
  },
  bottomNavBadgeActive: {
    backgroundColor: colors.primary100,
    color: colors.primary700,
  },
  bottomDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.neutral200,
    margin: `${spacing["2xs"]} ${spacing["2xs"]}`,
  },
  bottomActions: {
    display: "flex",
    alignItems: "center",
    gap: spacing["3xs"],
  },
  bottomActionBtn: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.m,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    padding: 0,
  },
  // Patient identity block — avatar overlaps the top of the text tile so the
  // circle sits half-in, half-out of the card. Wrapper has no bg; the tile
  // below it carries the primary100 cream.
  patientWrapper: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 36,
  },
  avatar: {
    position: "absolute" as const,
    top: 0,
    width: 72,
    height: 72,
    borderRadius: radii.full,
    overflow: "hidden",
    backgroundColor: colors.primary300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  // Figma node 2057:6696 — text tile. primary100 bg, radii.xl, vertical-m
  // padding, serif type. Top padding is boosted so the overlapping avatar
  // fits without crowding the primary line.
  patientCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    // Horizontal padding trimmed one step (m 16 → s 12) so the identity
    // line has more room inside the narrower 246px left column.
    padding: `${spacing["3xl"]} ${spacing.s} ${spacing.m}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing["2xs"],
    width: "100%",
  },
  patientPrimary: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    textAlign: "center",
    whiteSpace: "nowrap" as const,
  },
  patientSecondary: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    textAlign: "center",
    // Allow the "<name> (M|64)" line to wrap onto a second line when it
    // would overflow the 246px left column — no truncation.
    whiteSpace: "normal" as const,
    overflowWrap: "anywhere" as const,
  },

  // Figma node 2059:6764 — left-rail action list ("Visits / Reports / Files /
  // Timeline / Bills"). Container: primary100 bg, radius m, padding l/m, gap xs.
  actionList: {
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    // Horizontal padding trimmed one step (l 20 → m 16).
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    borderRadius: radii.m,
    cursor: "pointer",
    color: colors.neutral900,
    fontSize: fonts.size.m,
    width: "100%",
  },
  actionRowActive: {
    backgroundColor: colors.primary700,
    color: colors.neutral100,
  },
  actionIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
    color: "currentColor",
  },
  actionBadge: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.regular,
    flexShrink: 0,
    backgroundColor: colors.primary200,
    color: colors.neutral500,
  },
  actionBadgeActive: {
    backgroundColor: colors.primary600,
    color: colors.primary100,
  },
  actionLabel: {
    flex: 1,
  },
  // Quick Actions (phone / email / video / edit) — secondary affordances,
  // so the labels read one rung smaller than the primary nav above
  // (size.s 14 vs. size.m 16).
  shareActionRow: {
    fontSize: fonts.size.s,
  },
  actionCount: {
    color: colors.neutral500,
    fontSize: fonts.size.xs,
  },

  // Figma node 2073:3264 — contact card. Same container treatment as the
  // action list above; just no badges on the rows.
  shareCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    // Horizontal padding trimmed one step (l 20 → m 16) — matches actionList.
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },

  // ── Right column ─────────────────────────────────────────────────────────
  // Right area = visit tabs ABOVE the cream sheet (transparent wrapper).
  rightArea: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    minWidth: 0,
  },
  // Figma node 2057:6283 — main visit content sits on a white sheet (radius
  // xl, padding xl, gap xl). Each section card on top is transparent-filled
  // and separated only by its primary300 1px border.
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    minWidth: 0,
    backgroundColor: colors.primary200,
    padding: spacing.xl,
    borderRadius: radii.xl,
  },

  // Figma nodes 2133:9887 (inactive) + 2133:9894 (active) — visit tabs.
  // Each tab is a 136x40 pill with a caption (paragraph-xs) and label
  // (paragraph-m) rendered inline, gap xs.
  //   Inactive: alpha-black-0 bg, label in alpha-black-3
  //   Active:   white bg, label in neutral-900
  //   Caption is always alpha-black-3 regardless of state
  tabsBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    // Small breathing room under the (now compact) sticky header. The old 36px
    // offset existed to clear an overlapping avatar that no longer exists.
    marginTop: spacing.s,
  },
  // Figma node 2133:9927 — Tuning settings dropdown. Wrapper just pushes
  // the PopoverMenu trigger to the far right of the tabs row.
  tuningWrap: {
    marginLeft: "auto",
    flexShrink: 0,
    display: "inline-flex",
  },
  // Inactive caption (legacy) — solid neutral grey instead of alphaBlack3,
  // which washed out on the cream page tint.
  tabCaption: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontWeight: fonts.weight.regular,
    color: colors.neutral500,
  },

  // Section block — no longer a bordered card. Each section sits as a
  // vertical strip with a thin bottom-border line as the divider; the form
  // sheet's white background shows through. This buys back the horizontal
  // padding the boxes used to eat, so vitals/history/rx inputs get more
  // breathing room on the row.
  sectionCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    padding: spacing.l,
    background: colors.neutral100,
    borderRadius: radii["2xl"],
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.neutral900,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    color: colors.neutral900,
  },
  sectionTitle: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  // Chevron toggle — transparent button, rotates 180° when collapsed.
  sectionToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: colors.neutral900,
  },

  // Vitals — 6 columns × up to 2 rows. Each cell stacks label above a split
  // field (cream value 80×28 + bordered-white unit pill at right). Single-
  // cell columns push their content to the bottom so the second (isolated)
  // Hip aligns with BMI / Weight / Pulse on the lower row.
  // Single responsive grid — one cell per vital. Column count is tier-driven
  // (--vital-cols: 5 at 1440+, 4 at 1200–1439); the row-gap is sized so the
  // absolute error line under a row-1 cell can't collide with the row below.
  vitalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(var(--vital-cols), minmax(0, 1fr))",
    columnGap: "var(--vital-col-gap)",
    rowGap: "var(--vital-row-gap)",
    alignItems: "start",
    // Small reserve below the bottom row for the absolutely-positioned error
    // helper text; the section card's own bottom padding carries the rest, so
    // the block stays vertically balanced between its dividers (not bottom-heavy).
    paddingBottom: spacing.s,
  },
  vitalCell: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  vitalLabel: {
    fontSize: fonts.control.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
  },
  vitalInputRow: {
    display: "flex",
    alignItems: "center",
    height: 28,
  },
  vitalInputValue: {
    width: 80,
    height: "100%",
    border: "none",
    outline: "none",
    padding: spacing.xs,
    fontSize: fonts.control.sm,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderTopLeftRadius: radii.m,
    borderBottomLeftRadius: radii.m,
    textAlign: "center" as const,
  },
  // Out-of-range warning state — fills the input + unit pill with the
  // theme's `redAlpha10` (rgba(251, 55, 72, 0.1)), a soft transparent
  // pink-red wash over the cream. No underline, no border ring.
  vitalInputValueInvalid: {
    backgroundColor: colors.redAlpha10,
    color: colors.red200,
  },
  vitalUnitInvalid: {
    backgroundColor: colors.redAlpha10,
    color: colors.red200,
    // Add a red border in the invalid state so the warning reads clearly
    // (the default `vitalUnit` is borderless when valid).
    border: `${strokes.xs} solid ${colors.red200}`,
  },
  vitalInputInvalidText: {
    color: colors.red200,
    fontWeight: 500,
  },
  // Floats below the cell so it doesn't change the cell's height — keeps the
  // vitals grid rows aligned even when one cell has an error message.
  vitalErrorMessage: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    marginTop: spacing.xs,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontFamily: fonts.family.primary,
    color: colors.red200,
    whiteSpace: "nowrap" as const,
    pointerEvents: "none" as const,
  },
  // BP split: two narrow inputs separated by a fixed "/" character. Same
  // outer shape as `vitalInputValue` so it pairs cleanly with the unit pill.
  bpSplitInput: {
    width: 80,
    height: "100%",
    backgroundColor: colors.primary100,
    borderTopLeftRadius: radii.m,
    borderBottomLeftRadius: radii.m,
    display: "flex",
    alignItems: "center",
    padding: `0 ${spacing["2xs"]}`,
    boxSizing: "border-box" as const,
  },
  bpHalfInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: "none",
    outline: "none",
    padding: 0,
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: "transparent",
    textAlign: "center" as const,
  },
  bpSeparator: {
    flexShrink: 0,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    padding: `0 ${spacing["3xs"]}`,
    userSelect: "none" as const,
  },
  // Figma node 2057:6296 — unit pill: white bg, right-rounded corners.
  // Two variants:
  //   • Static units (cm / bpm / % …) — cream primary300 border, grey
  //     neutral500 text. Pure display, not interactive.
  //   • Clickable toggles (cm↔in, kg↔lb, °C↔°F, mmHg↔kPa, kg/m² calc)
  //     — black neutral900 border + black text, signalling the affordance.
  vitalUnit: {
    height: "100%",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral500,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderTopRightRadius: radii.m,
    borderBottomRightRadius: radii.m,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
    boxSizing: "border-box" as const,
    outline: "none",
  },
  // Variant applied when the pill is clickable (canToggle === true).
  // Border is primary500 (lighter peach) so the affordance reads as
  // interactive without competing with the darker CTA peach above; text
  // is neutral800 — slightly softer than 900 against the cream page.
  vitalUnitClickable: {
    color: colors.neutral800,
    borderColor: colors.primary500,
  },

  // 2x2 text-field grid (Chief Complaints — legacy)
  complaintsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.m,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fonts.control.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
  },
  textField: {
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    minHeight: 36,
    backgroundColor: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
  },

  // Figma node 2073:3030 — History 2×2 grid. Cream-filled fields (primary100),
  // radii.m, height 36, no border. Column gap 20 (spacing.l), row gap 12 (s).
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: spacing.l,
    rowGap: spacing.s,
    width: "100%",
  },
  historyField: {
    height: 36,
    border: "none",
    outline: "none",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    width: "100%",
    boxSizing: "border-box" as const,
  },

  // Single-row labeled field (Complaints note / Examination / Tests / Advice /
  // Refer to / Review). Label column 120px, label text uses serif semibold.
  bottomRows: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    padding: spacing.l,
    background: colors.neutral100,
    borderRadius: radii["2xl"],
  },
  noteRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
  },
  noteLabel: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    width: 120,
    flexShrink: 0,
    color: colors.neutral900,
    fontSize: fonts.size.m,
  },
  noteLabelText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  noteField: {
    flex: 1,
    minWidth: 0,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    minHeight: 36,
    backgroundColor: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
  },
  // Field wrapper for dictatable rows (Tests / Advice / Complaints / Examination).
  // Figma: cream primary100 fill, radii.m, 36 height, inline mic + rewind icons.
  noteFieldWrap: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: `0 ${spacing.xs}`,
    minHeight: 40,
  },
  noteFieldInner: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
  },
  dictateIcons: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.neutral700,
    flexShrink: 0,
  },
  // Figma node 2071:2962 — Linear/Essentional,UI/Reorder. Drag handle that
  // sits to the RIGHT of the dictate field (outside the cream wrapper).
  reorderHandle: {
    flexShrink: 0,
    color: colors.neutral900,
    cursor: "grab",
  },

  // Figma node 2143:11458 — sort/list-view toggles, far right of the
  // Reports tabs row. Two transparent 32x32 icon buttons grouped via a
  // marginLeft:auto wrapper.
  reportViewToggle: {
    marginLeft: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["3xs"],
    flexShrink: 0,
  },
  reportViewToggleButton: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.alphaBlack3,
    padding: 0,
    borderRadius: radii.xs,
  },
  // The currently selected view-mode toggle gets the dark color so the
  // pair reads as a segmented control (selected vs. unselected).
  reportViewToggleButtonActive: {
    color: colors.neutral900,
  },

  // Figma node 2143:11610 — grid layout. 4 columns, gap m. Each card is
  // ~200×200, cream wrapper with a white inner thumbnail tile and a
  // text footer (name + date + size).
  reportsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: spacing.m,
  },
  reportCard: {
    position: "relative" as const,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: spacing.s,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    aspectRatio: "1 / 1",
  },
  reportCardThumb: {
    position: "relative" as const,
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.primary300,
    overflow: "hidden",
  },
  reportCardThumbIcon: {
    width: 32,
    height: 32,
    color: colors.primary300,
  },
  reportCardMic: {
    position: "absolute" as const,
    right: spacing.s,
    bottom: spacing.s,
    color: colors.neutral700,
    display: "inline-flex",
  },
  reportCardKebab: {
    position: "absolute" as const,
    top: spacing.xs,
    right: spacing.xs,
    color: colors.neutral700,
    display: "inline-flex",
  },
  reportCardFooter: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["3xs"],
  },
  reportCardName: {
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
  },
  reportCardMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral400 ?? colors.neutral500,
    fontFamily: fonts.family.primary,
  },

  // Empty-state placeholder for sections that aren't built yet (Timeline,
  // Bills). Centered title + muted subtitle, no card chrome.
  comingSoon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing["3xl"]} ${spacing.l}`,
    gap: spacing.xs,
    minHeight: 200,
  },
  comingSoonTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  comingSoonBody: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    color: colors.alphaBlack3,
  },

  // ── Timeline tab — chronological feed of visits (peach node + synopsis) ──
  timeline: {
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
  },
  timelineList: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },
  // The vertical rail behind the dots (dots are 20px; centre at x=10).
  timelineLine: {
    position: "absolute",
    left: 9,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: colors.primary300,
  },
  timelineItem: {
    position: "relative",
    display: "flex",
    gap: spacing.m,
    alignItems: "flex-start",
  },
  timelineDot: {
    position: "relative",
    zIndex: 1,
    flexShrink: 0,
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.active.shade600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotIcon: {
    width: 12,
    height: 12,
    color: colors.neutral100,
  },
  timelineContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  timelineHead: {
    display: "flex",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  timelineTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },
  timelineDate: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
  },
  timelineSynopsis: {
    margin: `${spacing["3xs"]} 0 0`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral700,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  },

  // ── Info tab — reuses the New Appointment cards (ID/avatar · fields · AI) ──
  // 3-column grid matching the booking layout (book-col tokens) so the cards
  // line up with the rest of the app.
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "var(--book-col-left) minmax(0, 1fr) var(--book-col-right)",
    gap: "var(--book-grid-gap, 16px)",
    alignItems: "stretch",
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
  },
  // Avatar + T-number card — mirrors BookAppointment's patient ID card.
  infoIdCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.l,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
  },
  infoAvatar: {
    width: "var(--book-patient-avatar, 140px)",
    height: "var(--book-patient-avatar, 140px)",
    objectFit: "contain",
    display: "block",
  },
  infoIdText: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h2,
    color: colors.neutral900,
  },
  // Basic-info card — same shape as the booking details card, but the fields
  // are read-only text (no input underline).
  infoFieldsCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: spacing.l,
    padding: `${spacing.l} ${spacing.xl}`,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
  },
  infoRowIcon: {
    width: 22,
    height: 22,
    flexShrink: 0,
    color: colors.neutral700,
  },
  infoValue: {
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    color: colors.neutral900,
  },
  // AI summary card — occupies the Bill card's slot on the right.
  infoAiCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    padding: spacing.l,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
  },
  infoAiHead: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  infoAiSparkle: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: radii.s,
    backgroundColor: colors.primary200,
    fontSize: 14,
  },
  infoAiTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },
  infoAiBody: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.l,
    color: colors.neutral700,
  },

  // Figma node 2143:11171 — "+ Add Report" pill on the page header. Dark
  // neutral900 fill with primary100 text, full-radius pill.
  addReportButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
    height: 40,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.full,
    backgroundColor: colors.neutral900,
    color: colors.primary100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
    marginTop: spacing["2xs"],
  },
  addReportPlus: {
    fontSize: fonts.size.l,
    lineHeight: 1,
  },

  // Figma node 2143:11160 — AI Summary card. Cream tile in the left rail
  // with a serif title and a paragraph-s body.
  aiSummaryCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    // Horizontal padding trimmed one step (l 20 → m 16); vertical stays at 20.
    padding: `${spacing.l} ${spacing.m}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    textAlign: "center" as const,
  },
  aiSummaryTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  aiSummaryBody: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
  },
  aiSummaryStale: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
  },
  aiGenerateBtn: {
    marginTop: spacing.xs,
    alignSelf: "flex-start" as const,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium,
    cursor: "pointer",
  },

  // Figma node 2143:10938 — Reports table. Header row of column captions
  // (paragraph-xs, neutral500) followed by cream-filled data pills.
  // Columns: # (24) | mic chip (40) | name (flex) | category (120) |
  // date (120) | actions (120).
  reportsTable: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  reportsHeaderRow: {
    display: "grid",
    gridTemplateColumns: "24px 40px minmax(120px, 1fr) 120px 120px 120px",
    gap: spacing.s,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
  },
  reportRow: {
    display: "grid",
    gridTemplateColumns: "24px 40px minmax(120px, 1fr) 120px 120px 120px",
    gap: spacing.s,
    alignItems: "center",
    backgroundColor: colors.primary100,
    borderRadius: radii.xs,
    padding: spacing["2xs"],
    minHeight: 52,
  },
  reportSerial: {
    textAlign: "center" as const,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral700,
    fontFamily: fonts.family.primary,
  },
  // Cream chip wrapping the mic icon — primary200 fill, radii.m, padding 2xs.
  reportMicChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary200,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    width: 40,
    height: 40,
    color: colors.neutral900,
    flexShrink: 0,
  },
  reportName: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
  },
  reportCell: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral700,
    fontFamily: fonts.family.primary,
    textAlign: "center" as const,
  },
  reportActions: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    color: colors.neutral700,
  },

  // Figma node 2057:6283 — Complaints + Diagnosis (and Notes for Patient +
  // Private Notes) two-column textarea cards. Each card has a header row
  // (icon + title + kebab handle) and a cream textarea field with the
  // dictate icons docked at its bottom-right corner.
  // 2-column row (50/50): (Complaints, Diagnosis) and (Notes for Patient,
  // Private Notes). Section-strip styling (vertical padding + thin bottom
  // line) sits on the row wrapper so the pair shares one divider — not two
  // stacked borders. Flush left/right with no inset, aligning with Vitals
  // / History / Rx above.
  noteCardsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: spacing.xl,
  },
  noteCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    padding: spacing.l,
    background: colors.neutral100,
    borderRadius: radii["2xl"],
  },
  noteCardPrivate: {
    // Private Notes uses a neutral grey instead of cream so it reads as
    // "internal", visually separated from the patient-facing notes.
  },
  noteCardFieldPrivate: {
    // Figma 2255:10826 — Private Notes field uses neutral/alpha-black-0
    // (rgba(0,0,0,0.04)) so it reads as a light, internal-only tint
    // distinct from the patient-facing cream cards above it.
    backgroundColor: colors.alphaBlack0,
  },
  noteCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `0 ${spacing["2xs"]}`,
  },
  noteCardField: {
    position: "relative" as const,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    // Figma 2057:6364 — placeholder at (8, 8); 8px padding all round.
    padding: spacing.xs,
    minHeight: 123,
    display: "flex",
  },
  noteCardTextarea: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    resize: "none" as const,
    backgroundColor: "transparent",
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    minHeight: 80,
  },
  noteCardDictate: {
    position: "absolute" as const,
    // Figma 2064:6917 — dictate icons sit 8px from the right and bottom edge.
    right: spacing.xs,
    bottom: spacing.xs,
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.neutral700,
  },

  // Refer to — cream-filled dropdown matching the Tests dictatable row.
  referDropdown: {
    display: "inline-flex",
    alignItems: "center",
    height: 40,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    overflow: "hidden",
    cursor: "pointer",
  },
  referText: {
    display: "flex",
    alignItems: "center",
    minWidth: 160,
    padding: `0 ${spacing.s}`,
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral400,
  },
  referChevron: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${spacing.s} 0 0`,
    color: colors.neutral700,
  },
  // Dropdown menu of clinic doctors, opens below the Refer-To pill.
  referMenu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 200,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    display: "flex",
    flexDirection: "column",
    boxShadow: shadows.menu,
    zIndex: zIndex.popover,
    maxHeight: 240,
    overflowY: "auto" as const,
  },
  referMenuEmpty: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontStyle: "italic" as const,
  },
  referMenuItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start" as const,
    gap: spacing["3xs"],
    width: "100%",
    padding: `${spacing.xs} ${spacing.s}`,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    borderRadius: radii.xs,
    textAlign: "left" as const,
  },
  referMenuItemName: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
  },
  referMenuItemMeta: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
  },

  // Figma node 2057:6381 — Rx table. Each data row is cream-filled (primary100)
  // with radii.xs corners. Columns: # (24) | Medicine (flex) | Dosage |
  // When | Frequency | Duration (all 120) | Notes (auto).
  rxTable: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
  },
  rxInteractionBanner: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
    backgroundColor: colors.yellowAlpha10,
    border: `1px solid ${colors.yellow200}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
  },
  rxInteractionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  rxInteractionIcon: {
    fontSize: fonts.size.s,
    color: colors.neutral900,
    flexShrink: 0,
    marginTop: 1,
  },
  rxInteractionText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: "#7a5500",
  },
  // Figma node 2057:6381 — grid columns uniform at 120px for all five
  // right-side columns (Dosage / When / Frequency / Duration / Notes); the
  // rxGroup is the card container — white background matches the section card,
  // letting the cream (primary100) inputs inside read as fields (consistent
  // with the rest of the prescription form's white-card / cream-input pattern).
  rxGroup: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.s,
    alignItems: "flex-start",
    overflow: "visible" as const,
    backgroundColor: colors.neutral100,
    borderRadius: radii.xs,
    padding: `${spacing["2xs"]} ${spacing["2xs"]}`,
    // Push the bottom of the row down by the molecule height so the
    // medicine pill + right-side controls all sit on the same baseline,
    // and the molecule subtitle hangs into this extra space.
    paddingBottom: 22,
  },
  rxGroupLeft: {
    // Medicine column: capped at ~320 and does NOT grow, so the "+" stays near
    // the name instead of drifting to a far-right edge; squeezes to 160 when
    // tight. All extra row width flows to the pickers + notes on the right.
    flex: "0 1 320px" as const,
    minWidth: 160,
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing["2xs"],
    alignItems: "flex-start",
  },
  rxGroupRight: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    gap: spacing.xs,
  },
  rxDataRow: {
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.s,
    // Top-align so a multi-line Notes grows DOWNWARD while the pickers stay on
    // the first line (not floated to the Notes' vertical centre).
    alignItems: "flex-start",
  },
  rxDataCell: {
    // Pickers hold ~116px but squeeze down to 72 before the row would overflow
    // (was a hard 120 / flexShrink:0, which forced horizontal overflow).
    flex: "0 1 116px" as const,
    minWidth: 72,
  },
  rxMedicineTypeBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral600,
    backgroundColor: colors.neutral200,
    borderRadius: radii.full,
    padding: `1px ${spacing.xs}`,
    flexShrink: 0,
  },
  rxTaperBtn: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.primary600,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: `2px ${spacing["2xs"]}`,
    borderRadius: radii.xs,
    flexShrink: 0,
  },
  rxDeleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    // Match the field height so the icon centres on the field line (the row is
    // top-aligned so Notes can grow downward — a 28px button would ride high).
    height: "var(--input-h, 40px)",
    lineHeight: 1,
    color: colors.neutral500,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: radii.xs,
    padding: 0,
    flexShrink: 0,
  },
  rxCell: {
    border: "none",
    borderRadius: radii.m,
    padding: `${spacing["3xs"]} ${spacing.s}`,
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    outline: "none",
    fontFamily: fonts.family.primary,
    minWidth: 0,
    height: 40,
    boxSizing: "border-box",
    textAlign: "center" as const,
  },
  rxSerial: {
    flexShrink: 0,
    width: 24,
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    textAlign: "center" as const,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Medicine cell — input + (generic-name + add-tapering) stacked horizontally.
  // The input column centers vertically; the trailing column (generic + button)
  // sits at the bottom of the cell. Cell keeps the full row height.
  rxMedicineCell: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing["2xs"],
    minHeight: 40,
    minWidth: 0,
  },
  rxMedicineInputCol: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
  },
  rxMedicineInput: {
    border: "none",
    outline: "none",
    padding: `0 ${spacing.s}`,
    height: 40,
    boxSizing: "border-box" as const,
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    minWidth: 0,
  },
  rxGenericRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: spacing["2xs"],
    padding: "2px 0",
    flexShrink: 0,
    minWidth: 0,
  },
  rxGenericName: {
    width: "100%",
    minWidth: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    // Reset input chrome so the molecule editor looks like the old span.
    border: "none",
    outline: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    boxSizing: "border-box" as const,
  },
  rxAddNoteBtn: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.neutral500,
    borderRadius: radii.xs,
  },
  rxMedicineNote: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    color: colors.alphaBlack3,
  },
  rxMedicineNoteInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontFamily: fonts.family.primary,
    color: colors.alphaBlack3,
    backgroundColor: "transparent",
  },

  // Figma node 2143:10552 — "Add Medicine" row. Sits below the cream data
  // rows on the white sheet, so no fill. Plus-glyph + label on the left, the
  // rewind+mic dictate icons before the drag handle on the right.
  addMedicineRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.s,
    padding: `${spacing["2xs"]} 0`,
    borderRadius: radii.xs,
    backgroundColor: "transparent",
  },
  addMedicinePlus: {
    width: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    color: colors.neutral500,
    flexShrink: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  addMedicineText: {
    flex: 1,
    minWidth: 0,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    textAlign: "left" as const,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },

  // Review row — date picker (primary300 bordered) + long cream text field.
  reviewRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    flex: 1,
    minWidth: 0,
  },
  // Figma node 2057:6522 — date chip: calendar icon 24px + "Select Date"
  // placeholder. primary300 border, radii.m, padding xs, gap xs.
  reviewDate: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
    height: 40,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing.xs,
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
    cursor: "pointer",
  },
  reviewDateText: {
    fontSize: fonts.control.sm,
    fontFamily: fonts.family.primary,
    color: colors.neutral400,
    whiteSpace: "nowrap" as const,
  },
  reviewLong: {
    flex: 1,
    minWidth: 0,
    height: 40,
    border: "none",
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    outline: "none",
    fontFamily: fonts.family.primary,
  },
  // Next Review — "or ___ days" segment between the date chip and the notes
  // input. The number input has a thin underline; "days" sits as a label.
  reviewOr: {
    flexShrink: 0,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
  },
  reviewDaysWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  reviewDaysInput: {
    width: 56,
    height: 32,
    border: "none",
    borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
    backgroundColor: "transparent",
    outline: "none",
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    textAlign: "center" as const,
  },
  reviewDaysLabel: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
  },

  // Empty state for the Visits tab when a patient has no recorded visits
  // (e.g. just added or freshly migrated, with no appointment).
  noVisits: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: spacing.s,
    // Extra top padding nudges the empty state down from the sheet's edge.
    padding: `${spacing["6xl"]} ${spacing.xl} ${spacing["3xl"]}`,
  },
  noVisitsIcon: {
    color: colors.neutral400,
  },
  noVisitsTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  noVisitsText: {
    margin: 0,
    maxWidth: 360,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral500,
  },
  noVisitsBtn: {
    marginTop: spacing.xs,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.pill,
    padding: "10px 28px",
    cursor: "pointer",
  },

};
