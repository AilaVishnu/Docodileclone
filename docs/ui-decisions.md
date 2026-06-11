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

## 2. Inputs — _built, ready for review_
IDs: `INP-CANON/select/domain/box35/box40/pill`, `INV-1..4` + `INV-CANON`, `INP-FIELD*`.
Decision: pick ONE field idiom + height; one invalid-state treatment (proposed: red200 border + redAlpha10 fill).

## 3. Dropdowns / selects — _built, ready for review_
IDs: `MENU-select` (canonical but outlier), `MENU-primary/underline/picker/destructive`, `MENU-CANON`, `TRIG-select/-active/picker/native`.
Decision: one menu surface (border/radius/shadow/hover/selected); add a `shadows` token; fix the inverted chevron convention.

## 4. Modals / dialogs — _built, ready for review_
IDs: `MOD-canon`, `MOD-print/bill/service/presets/confirm/slot/ai`, `MOD-CANON-PROPOSED`.
Decision: one shell + a `zIndex` scale; pick surface (tint/white/cream), backdrop opacity, radius, shadow, close style.

## 5. Nav / tabs / headers — _built, ready for review_
IDs: `TAB-block/rxfilter/stats/visit/pharmacy/connected/clinic`, `CHIP-conflict`, `HDR-pageheader/rx/settings`, `TAB-CANON`.
Decision: one Tabs (white-pill, single active tone); fold rxHeader + Settings into PageHeader.

## 6. Cards — _built, ready for review_
IDs: `CARD-R8/R16/R20`, `CARD-BG-*`, `CARD-canon/bill/clinic/clinicdisplay/clinicinfo/hint/staff/addstaff/docstatus/heatmap/login/kpi`, `CARD-CANON-PROPOSED`.
Merge pairs: clinic+clinicdisplay(+clinicinfo), staff+addstaff, docstatus+heatmap. Decision: retire radii.primary(20)→16; add shadows token.

## 7. Tables / lists — _built, ready for review_
IDs: `TBL-queue` (canonical), `TBL-rx/pharmacy/archived/stats`, `TBL-DIV`, `TBL-PILLS`, `TBL-CANON-PROPOSED`.
Decision: one DataTable on queue conventions; unify the two status-pill systems; fix Stats header outlier.

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
| `shadows` token | Add a shadow scale to `theme.ts`? (~12 ad-hoc recipes today) | ⬜ |
| `zIndex` scale | Add a z-index scale? (raw 1000→4000 today) | ⬜ |
| `icon.size` token | Make 24px a real token (currently only a comment)? | ⬜ |
| `radii.primary` (20) | Retire the legacy 20px radius in favour of 16? | ⬜ |
