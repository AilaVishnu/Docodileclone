# Docodile UI — Design-System Decision Sheet

> Living record of the visual-review pass. Each variant has a stable **ID** (shown in the `/audit` gallery).
> Reply with verdicts by ID, e.g. *"BTN canonical is correct; CLOSE-1 is canonical, fix the rest; SB-icon → leave it."*
>
> **Legend:** ✅ canonical (the one to keep) · 🔧 fix to match canonical · 🗑️ remove/delete · 🤔 discuss · ⬜ pending review
>
> Nothing in the real app changes until a category is fully decided and you approve the fix phase.

Review order: Buttons → Inputs → Dropdowns → Modals → Nav/Tabs → Cards → Tables → Icons → Colors/Tokens → Typography/Spacing → Pages. (Duplicates & merge candidates fall out of the above.)

---

## ✅ Implemented in code — 2026-06-11

**New component:** `components/IconButton` — canonical close/icon button (32px circle, neutral700, hover tint, accessible `ariaLabel`, defaults to a ✕).

**CLOSE-canon — done.** ~12 modal/panel close ✕ buttons replaced with `<IconButton>`: ChatPanel, BillMedicinesModal, AddServiceModal, AddReportModal, EditPatientModal (×2), NewPrescriptionModal, PrescriptionPage (Save-template + AI-SOAP modals), FileViewer, AddStaffModal, PharmacyView (shared `ModalHeader`). Dead `closeBtn`/`CloseIcon` styles removed. _Left as follow-up: chip-remove ✕ (Tag/Autocomplete), field-clear ✕, Toast dismiss._

**CTA-canon — done.** Modal footers now use `<Button variant="light">` Cancel + `<Button variant="primary">` Save: EditPatient / AddReport / NewPrescription / AddService / Pharmacy / ImportData. **Retained:** the Archive-patient underline link, and Pharmacy's destructive `Remove` (`btnDanger`). Dead `btnPrimary`/`btnGhost`/`saveBtn`/`cancelBtn` styles removed.

**dangerLight removed.** All 8 usages were Cancel/Nope buttons → switched to `light` (AppointmentQueue ×2, BookAppointment, AddStaffModal ×2, SessionBar ×2, HomePage). Variant deleted from `Button.styles.ts` + `Button.tsx` union + DesignSystem demo array.

**Verified:** `tsc --noEmit` → 0 errors; webpack compiles clean; `/audit` gallery updated to show the shipped state. ⚠️ NOT visually verified in the running app (login wall) — recommend a manual click-through of the affected modals.

**Also now done (2026-06-11):** `secondary`↔`secondarySolid` merge (secondary = secondary700 → 800 hover; TopNav repointed) · grey disabled for all 6 variants (filled neutral200/neutral500/no-stroke; outline neutral400) · `md` height +2px (44/36). **The Button category is fully implemented + committed (`batman`).**

---

## 1. Buttons & controls  — _status: ✅ FULLY IMPLEMENTED + committed (batman)_

| ID | What it is | Source | Verdict | Canonical decision / fix note |
|----|------------|--------|---------|-------------------------------|
| BTN-* | Canonical `<Button>` — 8 variants × 4 sizes | `components/Button/Button.styles.ts` | ⬜ | Reference set — confirm this is the one true button |
| CTA-1 | Modal primary, bg `primary700` (not theme-aware), `radii.full`, 10×20, no height | `EditPatientModal.tsx:768` | ⬜ | |
| CTA-2 | Modal "save", bg `neutral900`, `radii.full`, 8×20 | `Services/AddServiceModal.styles.ts` | ⬜ | |
| CTA-3 | Modal ghost/cancel, `1px primary300` pill, 10×20 | `EditPatientModal.tsx:758` | ⬜ | |
| CTA-4 | Cancel as underlined text-link | `Services/AddServiceModal.styles.ts` | ⬜ | |
| CTA-5 | Archive as `red100` underline text | `EditPatientModal.tsx:781` | ⬜ | |
| CLOSE-1 | ✕ — 28×28, circle (50%), `neutral700` | `Chat/ChatPanel.tsx:762` | ⬜ | |
| CLOSE-2 | ✕ — 28×28, square, `neutral500` | `BillMedicinesModal.tsx:576` | ⬜ | |
| CLOSE-3 | ✕ — 28×28, square, `neutral500` | `Services/AddServiceModal.styles.ts:40` | ⬜ | |
| CLOSE-4 | ✕ — unsized glyph, `size.m`, `neutral900` | `AddReportModal.tsx:491` | ⬜ | |
| CLOSE-5 | ✕ — glyph, `fontSize 22`, `#666` (off-token) | `PrescriptionPage.tsx:3384` | ⬜ | |
| SB-start | h40 `radii.full` `green200` | `SessionBar.tsx` | ⬜ | |
| SB-pause | h40 `radii.full` `yellow200` | `SessionBar.tsx` | ⬜ | |
| SB-stop | h32 `radii.xs` `red100` | `SessionBar.tsx` | ⬜ | |
| SB-icon | h32 `radii.xs` icon-only (vs canonical 40/42) | `SessionBar.tsx` | ⬜ | |
| TAG | `<Tag>` outline / filled + remove | `components/Tag/Tag.tsx` | ⬜ | |
| SW | `<Switch>` sm / md | `components/Switch/Switch.tsx` | ⬜ | |

### Button variant decisions — FINAL 2026-06-11 (8 → 6 variants)
- **primary** — ✅ keep as-is.
- **dark** — ✅ keep; hover neutral900 → neutral1000. _Already implemented ([Button.styles.ts:61]); no change._
- **secondary** — 🔧 MERGE `secondary` + `secondarySolid` → one `secondary` using the **secondarySolid** values (default secondary700, hover secondary800, disabled secondary300); drop old `secondary` (800→700).
  - Impact: `TopNav.tsx:249` `"secondarySolid"`→`"secondary"` + simplify ternary; remove `secondarySolid` from `Button.tsx` union. **LoginCard admin Sign-in** (`LoginCard.tsx:194,281`, currently `secondary`=800) shifts to the lighter 700 look + darken-on-hover — minor intended visual change.
- **primaryLight** — ✅ KEEP (themed outline, active.shade600). Note: **0 current usages** — reserved for future themed secondary-outline actions.
- **dangerLight** — 🗑️ REMOVE. Used 8× but ONLY as the red "Cancel/Nope" button in confirm dialogs (the destructive action is `dark`). Switch all 8 → `variant="light"` (neutral grey outline); remove the variant + type-union entry + DesignSystem demo entry.
  - Sites → `light`: `AddStaffModal.tsx:310,330` · `BookAppointment.tsx:1201` · `AppointmentQueue.tsx:586,804` · `SessionBar.tsx:462,499` · `HomePage.tsx:353`.
- **secondaryLight** — ✅ keep.  ·  **light** — ✅ keep.
- **text = outline** (primaryLight / secondaryLight / light) — ✅ ALREADY the case in every state (verified rendered: primaryLight #E48647, secondaryLight #6C8145, light #202020, incl. disabled). No change.
- **disabled** — ✅ APPROVED **grey**: filled (primary/dark/secondary) → neutral200 fill + neutral500 text + **no stroke**; outline (primaryLight/secondaryLight/light) → neutral400 border + matching neutral400 text. Apply to all 6 `disabled` blocks in Button.styles.ts.
- **sizes** — ✅ sm unchanged (`--btn-sm-h` 40/32). md **+2px → 44/36** (was 42/34) for a real 4px gap. Fix: globals.css `--btn-md-h: 44` (:root) + `34→36` (compact media). Note `mdIcon` also reads `--btn-md-h`, so it tracks to 44/36 too (fine/consistent).
- **responsiveness** — buttons step down one tier <1440 (h 40→32 / 42→34, fs 16→14) via --btn-* vars; padding/radius/border/icon fixed. ✅ confirmed behaviour.
- **FINAL SET (6): `primary · dark · secondary · primaryLight · secondaryLight · light`**
- _Design note: Cancel red→grey is a deliberate change to those 8 dialogs. The destructive confirm stays `dark` (filled black), NOT red — flagged, not changed (that was option 3, which you didn't pick)._

## 2. Inputs — _✅ BUILT 2026-06-11_
IDs: `INP-CANON/select/domain/box35/box40/pill`, `INV-1..4` + `INV-CANON`, `INP-FIELD*`.
DECISION:
- ✅ Approve one canonical `<Field variant size error>` component (3 looks).
- **Looks kept, assigned by context (no field changes its look):** `underline` stays where underline is today; `box` stays where box is today; `pill` is ONLY for search inputs (e.g. PatientPicker search). Today's placement already matches, so this is a consolidation, not a re-style.
- **Standardize heights + make them RESPONSIVE** — `<Field>` reads `--input-h` (40px baseline → **32px on the 1200–1439 tier**) + `--input-pady` (6→3), so every field compacts together on smaller laptops. Today only `TextInput` & `Select` honor this; DomainInput (54), the boxed inputs (35/40), PatientPicker pill (48) and the pickers hardcode their height and DON'T compact — a real bug the `<Field>` fixes. Kills the 35/40/48/54 scatter. DomainInput's suffix box is the one possible exception (confirm during build).
- **One invalid state:** `red200` border + `redAlpha10` soft fill (INV-CANON) — replaces the 5 ad-hoc error looks incl. `rgba(255,0,0,0.05)` and raw `1px solid red`.
- ✅ BUILT: new `components/Field` (underline/box/pill, responsive via `--input-h`, unified `red200 + redAlpha10` error). `TextInput` is now a thin alias of `<Field variant="underline">`. DomainInput made responsive + unified error; PatientPicker search → `<Field variant="pill">`; the boxed form inputs (Pharmacy / NewPrescription / EditPatient) now use `--input-h` so they compact on the lower tier. Also fixed a pre-existing React border-shorthand warning in Select + DomainInput.
- _Optional follow-up:_ migrate every remaining inline form `<input>` to `<Field>`; make the Select/date-trigger buttons compact too (the agent flagged `selectInput`/`selectTrigger`/`dobTrigger` still hardcode their height).

## 3. Dropdowns / selects — _✅ BUILT 2026-06-11_
IDs: `MENU-select/primary/underline/picker/destructive`, `MENU-CANON`, `TRIG-*`.
DECISION:
- **Menu surface = thin warm border + soft shadow** (Option A = the `MENU-primary` look already used by ~22 files): bg neutral100, `1px primary300` border, `radii.m`, ONE soft shadow, hover `active.shade100`, selected `primary100` + `primary700` text.
- **Reconcile the 2 outliers** to match: the official `Select` menu (today borderless + `2px 2px 12px` offset shadow) → add the `primary300` border + the standard shadow; `UnderlineSelect` (12px literal radius + `0 4px 20px` shadow) → `radii.m` + standard shadow.
- **Add a `shadows` token** to theme.ts (one menu shadow, e.g. `0 4px 16px rgba(0,0,0,0.08)`) — kills the 8+ ad-hoc shadow strings; menus point at it.
- ✅ **3 TYPES KEPT, each for a context** (2026-06-11 refinement): `primary` (the default bordered look), `underline` (sticky header ONLY), `picker` (Rx / prescription form). They share the bordered panel + chevron + responsive height, and differ only in their trigger + usage context.
- ✅ **Unified the chevron**: all 3 types now use the canonical `ChevronDown` @ 16px. Select's flat 14×6 arrow and the pickers' `chevron-up.svg` (inverted rotation) were both swapped for it. (The rotation DIRECTION was already correct everywhere — only the icon changed.)
- ✅ **Compact lower tier (<1440):** the 5 picker triggers now use `--input-h` (40 → 32 on the lower tier), matching the field compaction; Select already did; the underline trigger compacts via the type scale.
- ✅ **Fixed off-token destructive colour** `#c0392b` → `red200` (PopoverMenu).
- ✅ BUILT: `shadows` token added to theme.ts (`menu`/`modal`/`card`); `Select` + `UnderlineSelect` menus reconciled to the bordered look + `shadows.menu` + cream hover / `primary100` selected.
- _Follow-up:_ point the ~22 menus that already hardcode `0 4px 16px rgba(0,0,0,0.08)` at `shadows.menu` (same value, single-source); optionally extract a shared `<Menu>`/`<Popover>` primitive so the panel isn't hand-rolled in ~22 files.

## 4. Modals / dialogs — _✅ BUILT 2026-06-11_
IDs: `MOD-canon`, `MOD-print/bill/service/presets/confirm/slot/ai`, `MOD-CANON-PROPOSED`.
DECISION (approved the proposed canonical Modal, with 2 tweaks):
- ✅ Adopt one canonical `<Modal>` shell: tokenized backdrop (one opacity, e.g. `alphaBlack3`), a real **`zIndex` scale** in theme.ts (fixes the 1000→4000 chaos + the base-Modal-sitting-under-its-own-confirm-dialog bug), one radius, one shadow (`shadows.modal`), Esc-to-close + scroll-lock by default.
- 🔸 **RETAIN each modal's existing background colour** — do NOT unify the surface. White / cream / tint stay per-modal (via a `surface`/bg prop on `<Modal>`).
- 🔸 **Close ✕ = the shared IconButton (CLOSE-CANON)** — already done for the ~12 modal closes converted in the Buttons phase; the canonical Modal uses IconButton for its header ✕.
- ✅ BUILT: rebuilt `<Modal>` (tokenized backdrop / `shadows.modal` / `radii["2xl"]` + Esc + scroll-lock + `surface`/`width`/`level` props, back-compat defaults so the 16 existing callers are unchanged except the z-index fix). Added a `zIndex` scale to theme.ts (modal 4000 — above the sidebar; modalTop 4100 for confirm-over-modal). Migrated the 7 hand-rolled overlays onto `<Modal>` keeping their colours: PrintPreview, BillMedicines (surface transparent — preserves the zigzag), AddService, SchedulePresets, AddStaff delete-confirm (`level="top"`), slot-picker, AI-SOAP.
- ⚠️ NOT click-tested live (login wall) — recommend a manual pass: open a couple of modals (do they appear ABOVE the sidebar now? does Esc close them? does the bill receipt's torn edge still show the dark backdrop?).

### Chevron icon — updated 2026-06-11
The canonical `ChevronDown` now uses the path you provided (`M19 9L12 15L5 9`, strokeWidth 1.5), colour driven by the `color` prop (not hardcoded). Propagates to all 3 dropdown types.

## 5. Nav / tabs (TABS only) — _✅ BUILT 2026-06-11_
IDs: `TAB-block/rxfilter/stats/visit/pharmacy/connected/clinic`, `CHIP-conflict`, `HDR-pageheader/rx/settings`, `TAB-CANON`.
DECISION (per A/B/C/D/E review):
- **E = canonical** white-pill `<Tabs>`. ✅ Now has TWO sizes: `md` (the larger "E") and `size="sm"` (the smaller "visit"). RESPONSIVE: `md` compacts 40/r12 → 32/r8 below 1440 via new `--tab-md-h` / `--tab-md-r` vars (so at the lower tier all tabs read like the visit size; above 1440 both sizes are available).
- **A (white-pill clones):** Rx-filter (`PrescriptionQueue.styles`) + Stats strip (`StatsPage`) aligned to the responsive `--tab-md-*` vars. (Full migration of these hand-rolled bars onto the `<Tabs>` component itself = optional follow-up; visually + responsively they now match.)
- **B:** Pharmacy `togglePill` → the white pill (was an inverted dark pill, which even contradicted its own code comment) + responsive. The sort/range **chips RETAINED** as-is.
- **C (legacy trapezoid)** + **D (headers: PageHeader / rxHeader / Settings)** — RETAINED as-is per your call.
- _Not built:_ headers were explicitly kept, so the earlier "fold rxHeader/Settings into PageHeader" idea is dropped.
- ⚠️ Not click-tested live (login wall) — recommend resizing the window across 1440 to confirm tabs compact.

## 6. Cards — _✅ BUILT 2026-06-11_
IDs: `CARD-R8/R16/R20`, `CARD-BG-*`, `CARD-canon/bill/clinic/clinicdisplay/clinicinfo/hint/staff/addstaff/docstatus/heatmap/login/kpi`, `CARD-CANON`.
DECISION (per the 4-question review):
- **Corners → 16 everywhere.** Snap ALL card surfaces to `radii.2xl(16)` — retiring the legacy `radii.primary(20)` *and* pulling the 8px staff/kpi tiles up to 16. One card radius. (radii.primary stays in theme.ts for Tabs/ClinicTabs/Modal/Workspace/SetupPassword — mopped up in their own categories.)
- **Keep the soft shadow** on the clinic card. Both clinic cards are now `raised`; everything else flat.
- **Keep all 3 paper colours** as meaningful variants: `sage`(secondary50)=clinic · `cream`(primary100)=staff/queue · `surface`(neutral100 white)=bills/stats. Login stays its own themed bg (just corner-snapped).
- **Merge all 3 near-twin sets** at the surface level (not a risky whole-component collapse, since I can't click-test):
  - **clinic** — ClinicCard + ClinicDisplayCard now both spread `cardSurface("sage","raised")` (ClinicCard *gains* the shadow; ClinicDisplay's literal shadow → `shadows.card` token; both → 16).
  - **staff** — StaffDetailsCard + AdditionalStaffDetailsCard both spread `cardSurface("cream","none")` (8 → 16). Only their inner content gap still differs (intended).
  - **queue-sidebar** — DoctorStatusCard + HeatmapCard both spread `cardSurface("cream","none")` (literal "20px" → 16).
- ✅ BUILT: new **`cardSurface(variant, elevation)`** helper in `components/Card/Card.styles.ts` = ONE source for every card's paper (bg + 16 radius + optional `shadows.card`). The 6 merge-pair cards spread it; bespoke cards (Hint dashed, Login themed, Bill torn-edge) keep their look but got corner-snapped to 16; StatsPage `kpiCard` → 16. The `<Card>` component now also takes optional `variant`/`elevation`/`padding` props (defaulting to the legacy transparent shell, so the existing section-wrapper callers are untouched).
- _Not done (deliberate, flagged for follow-up):_ (a) full component-collapse of the clinic family into one parametrised component — surfaces are unified, contents still live in separate files; (b) the clinic-family **tag pill** still diverges (`secondary700` filled on ClinicCard vs `secondary300` on ClinicDisplay/ClinicInfo) — that's content, not surface; pick one in a quick later pass.
- ⚠️ NOT click-tested live (login wall) — `tsc --noEmit` 0 errors. Spot-check please: clinic cards (rounder + now have a soft shadow), the staff form cards + Stats KPI tiles (8→16, slightly rounder), and the queue sidebar (doctor/heatmap corners).

## 7. Tables / lists — _✅ BUILT 2026-06-11_
IDs: `TBL-queue` (canonical), `TBL-rx/pharmacy/archived/stats`, `TBL-DIV`, `TBL-PILLS`, `TBL-CANON`.
DECISION (per the 4-question review):
- **Approach = unify the look only** (user had no preference; I took the safe path since the live app can't be click-tested behind the login wall). NO full `<DataTable>` component — that would rewrite each table's data/click/sort/timer logic blind. Left as a future option.
- **Fix the Stats outlier.** Its header was `neutral500` / weight 500 vs everyone else's `alphaBlack3` / 400 — brought into line.
- **Leave corners as-is.** The 10/16/24/asymmetric card radii were explicitly KEPT (incl. the appointment-queue table's intentional `"0 24px 24px 24px"` tab-tuck, which tucks it under its Tabs). No radius changes.
- **Merge the two status pills** into one shared `StatusBadge`.
- ✅ BUILT:
  - New **`styles/tableStyles.ts`** — `tableHeadCell` (alphaBlack3 / weight 400 / `primary300` divider) + `tableDivider`. The 5 tables (AppointmentQueue, PrescriptionQueue, Pharmacy, ArchivedPatients, Stats) now spread `tableHeadCell` into their `th` and use `tableDivider` for row/cell borders. The 4 already-matching tables become a no-op single-source; Stats is the one visible fix.
  - **Pill merge:** `StatusBadge` gained an optional **`started`** prop — when `started && status===IN_PROGRESS` it reads **"Ongoing" on `secondary100`** (no timer), matching the retired rx pill. The appointment queue's `patientId`→live-timer path is unchanged. `PrescriptionQueue` now renders `<StatusBadge started>`; the duplicate `StatusPill` + `pillStyles` were deleted, and dead `fonts`/`spacing` imports trimmed.
- _Not done (deliberate, flagged):_ (a) full `<DataTable>` component; (b) the `PatientFilesPage` → `AppointmentQueue.styles` cross-page coupling still stands — it now inherits the shared header look transitively, but ideally imports `tableStyles` + its own container; (c) unknown rx statuses now render as a grey pill (StatusBadge fallback) instead of grey text — minor, arguably nicer.
- ⚠️ NOT click-tested live (login wall) — `tsc --noEmit` 0 errors. Spot-check please: **prescription queue** pills (esp. a started session → "Ongoing" sage pill; and that the appointment queue's live timer is unaffected) and the **Stats** overdue/dues table header (now soft-black, lighter).

## 8. Icons — _built, ready for review_
IDs: `ICON-dups-1a..5b`, `ICON-chevron-1..3`, `ICON-close-1..4`, `ICON-size-*`, `ICON-color-*`, `ICON-CANON-*`.
Decision: one `<Icon name size color>` @24 + currentColor; delete 11 dead files; strip baked colours.

## 9. Colors outside tokens — _built, ready for review_
IDs: `CLR-grey-1..9`, `CLR-amber-1..3`, `CLR-red-1..4`, `CLR-invalidfill-1/2`, `CLR-green-1..3`.
Decision: approve each off-token→token mapping (greys→neutral*, ambers→yellow*, reds→red*, invalid fill→redAlpha10).

## 10. Typography / spacing — _built, ready for review_
IDs: `TYPE-scale`+`TYPE-1..23`, `SPACE-scale`+`SPACE-1..9`, `RAD-scale`+`RAD-1..5`.
Decision: confirm off-scale sizes (9/10/15/22), weight 300, spacing 6/10, radii 3/9/24/40/55 should snap to scale.

## 11–12. Duplicates / merge — flagged inline in categories 2–7 (picker family, autocompletes, clinic/staff/queue cards, the two tables/status-pills).

## 13. Off-style pages — _built, ready for review (Category 11 in the gallery)_
IDs: `PAGE-*` rating table + `PAGE-setup/pharmacy/rx` drift mocks.
Decision: rebuild SetupPasswordPage on shared comps; tokenize Pharmacy CSV zone + Rx AI-modal/banners.

---

### Token-level decisions (cascade into everything)
| Topic | Question | Verdict |
|-------|----------|---------|
| `shadows` token | Add a shadow scale to `theme.ts`? (~12 ad-hoc recipes today) | ✅ DONE — `shadows.{menu,modal,card}` (Dropdowns/Modals/Cards phases) |
| `zIndex` scale | Add a z-index scale? (raw 1000→4000 today) | ✅ DONE — `zIndex` scale added (Modals phase) |
| `icon.size` token | Make 24px a real token (currently only a comment)? | ⬜ (Category 8 · Icons) |
| `radii.primary` (20) | Retire the legacy 20px radius in favour of 16? | 🔧 PARTIAL — retired from all cards (→16, Cards phase); Tabs/ClinicTabs/Modal/Workspace/SetupPassword still on it |
