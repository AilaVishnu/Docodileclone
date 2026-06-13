# Design-system cleanup log

Running record of the component-by-component review (Storybook localhost:6006). Each entry: what was reviewed, the decision, and where it was fixed. Newest first.

## Round 8 — radio font + tables Step 0 (booking-form components sequenced next)

Reviewing the appointment booking page (BookAppointment). Shipped:
- **Radio label font `control.sm` → `control.md`** — radios now match the input-field / select font at both tiers (the size the user liked). Applies app-wide (gender, role, payment, type).
- **`Overview/Tables` page** (`src/sb/overviews/Tables.stories.tsx`) — "Step 0" for the tables consolidation: shows the canonical `DataGrid` (default + dense `s`) and a full **inventory** of every tabular surface with its build method + plan (rendered, fittingly, in a DataGrid with tier pills). Migration tiers (1/2/3) to be discussed.
- **BillCard confirmed reuse-ready** (the "quick bill" component) — already a clean self-contained component with a clear prop interface + story; no change needed.

- **PatientDetailsForm built + integrated** (`components/PatientDetailsForm/`) — the name/email/phone/DOB(digit-entry + calendar)/age/gender card lifted out of BookAppointment into a reusable, controlled component (`value`/`onChange` + parent-owned `dobDigits` + `patients` for autocomplete + `locked`/`onSelectExisting`). Story has Default / Locked / WithErrors. **Wired into BookAppointment** (the inline ~220-line card replaced with `<PatientDetailsForm>`); verified via the BookAppointment story — layout + behaviour identical.

- **BookAppointment tidied** — removed the patient-card leftovers the extraction orphaned (state/consts/icon imports/PatientSearchRow/patientSuggStyle).
- **DateField + TimeField built + integrated** (`components/DateField/`, `components/TimeField/`) — the appointment date/time trigger cards lifted into reusable components wrapping the existing `DatePicker` / `TimePicker`; trigger text moved to the **control-scale font** (was body `fs-m`). Wired into BookAppointment (date/time cards), DatePicker/TimePicker/ClockIcon imports dropped there. Stories: Empty / Filled / Disabled (+ WalkIn for TimeField). Verified — date still renders "13 Jun 2026" via `format={formatDate}`, no regression.

- **#2 PatientDetailsForm reused in NewPrescriptionModal** — the add-patient view's hand-rolled name/phone/email/DOB-trigger/age/gender fields replaced with `<PatientDetailsForm>` (booking underline-card look, confirmed). Age format reconciled: HomePage `handleWalkinNew` now parses `"years / months"` (was `Number(age)*12`). Removed NewRx's now-dead phone/age/dob handlers + GENDERS/parseDdMmYyyy/`set` + DatePicker/CalendarIcon/RadioGroup imports. Verified — renders the patient card framed by doctor/service selects, no regression.

- **Tables Tier 1 (started)** — **Archived patients** table migrated to `DataGrid` (columns + a Restore action render-prop; cream card + fetch/empty/error states kept). Added a `/api/patients/archived` MSW mock + `mockArchivedPatients` + an `ArchivedPatientsList` story (Default + Empty) so the page table is now verifiable in Storybook. Pattern for the rest: define `columns` (render-props for actions), keep the page's data/empty states, add a story.

- **Services catalog → DataGrid** — in-place migration (Short Form badge / Name / Price / Duration / Discount / GST + edit/delete action cell), empty/loading/error moved out of the table. Added `/api/tenant/services` MSW mock + `mockServices` + a `ServicesView` story (Default + Empty). Verified — renders identically (badges, muted cols, formatted prices, actions).

- **Pharmacy stock → DataGrid** — 12-col table migrated (right-aligned numerics, invoice link, delete/edit/adjust actions). Turned out to need neither zebra (trAlt was transparent) nor group headers (groupItems just orders); the real need was **horizontal scroll**, so added a `minWidth` prop to DataGrid (wraps in an overflow-x scroller). Presentational, so a `PharmacyListView` story (Default + Empty) with mock Meds — no API. Verified.
- **DataGrid polish (catalog feedback):** default row padding 16→12; header font → `control.xs` (smaller, both tiers).

Sequenced next (Tier 1 cont.):
- **Stats "Overdue reviews"** — only remaining Tier-1 table; trivial 3-col, buried in StatsPage (no story), low value — fold in or skip.
- **Tables Tier 2 — Stage 2 done: AppointmentQueue migrated onto shared QueueTable.** `components/AppointmentQueue/QueueTable.tsx` rebuilt as columns + render-props over `SharedQueueTable` (rowTone = status tint, groupBy = status with cancelled/no-show collapsed to INACTIVE, hover). Behaviour preserved: StatusDropdown (timer/lock/click-outside), status row-tones, vertical-line separators, walk-in pill, pay badge, T-numbers, ZeroQueue empty. **4 spec changes:** (1) Service now shows the **catalog short form** (GC/AST/LHR/HF) via a new `serviceCode` prop — parent `AppointmentQueue.tsx` fetches `listServices()` → name→code map (falls back to built-in abbreviation); (2) Status = our StatusBadge; (3) kebab = **vertical ⋮** trigger; (4) name = "Ramesh Babu - M 38". **Consolidation:** dropped the bespoke `ActionMenu` for the shared **PopoverMenu** (added an optional `openUpward` prop to it; right-aligned so the options card stays on-screen). Shared QueueTable got a per-column **`clip`** flag (default true) — overlay columns (status, actions) set `clip:false` so the dropdown/menu aren't cut off by the cell's text-truncation overflow. Verified in the `Patterns/AppointmentQueue/QueueTable` story: tsc + build clean, kebab menu + status dropdown both open visibly, tones/separators correct. **Next:** PrescriptionQueue PatientListTable (add a story first).

- **Tables Tier 2 — Stage 1 done:** shared `QueueTable` made production-ready — group separators now the real **centered vertical line** (was a borderTop) + a `hover` prop (subtle highlight on un-toned rows). Confirmed both queues share the exact shape (#/Name/Phone/Service/Type/Time/Status/trailing); only Status (dropdown vs read-only badge) + trailing cell (Pay+kebab vs View Pad) differ → both fit via render-props + rowTone + groupBy. **Next:** migrate AppointmentQueue (has a story to diff against) then PrescriptionQueue (add a story).

- **Tables Tier 2** — QueueTable **mock built** (`components/QueueTable/`, DRAFT): shared queue component — render-prop columns (status badge/dropdown, row actions), `rowTone(row)` status backgrounds, `groupBy(row)` separators. **Responsive via CSS-grid columns** (fixed px + flexible `fr`/`minmax`) — the clean equivalent of spacer columns; the story shows the same table at 1080px vs 720px adapting. **Review the mock, then migrate the real AppointmentQueue + PrescriptionQueue onto it** (one at a time, diff against live behaviour).

## Round 7 — ModalHeader migration + AddStaff field pass

- **6 modals migrated onto `ModalHeader`** — UploadModal, AddStaffModal, AddServiceModal, EditPatientModal (main header only — archive confirm left as-is per earlier call), NewPrescriptionModal, SchedulePresetsModal. Each now renders `<ModalHeader title=… subtitle=… onClose=… align=…>` instead of hand-rolling the header. Removed the per-file `header`/`title`/`subtitle` style objects + the now-unused `IconButton` imports (EditPatientModal keeps both — its archive confirm still uses them).
- **Look unchanged** for all except **NewPrescriptionModal**, whose title was the lone outlier at **h6** → now **h5** (the standard). Slightly larger; deliberate consistency fix.
- **AddStaffModal field pass** (AdditionalStaffDetailsCard) — every field is already a defined component (Field / Select / RadioGroup / MeasureField); nothing un-defined. Changes:
  - **Qualification + Reg. No.** (and the two "Other" free-text inputs) `Field variant="underline"` → **`box`** (icons kept).
  - **Experience** → **`MeasureField box unit="yrs"`** (matches AddServiceModal's Duration/Price fields); label "Experience (years)" → "Experience".
  - **Field labels** (Department, Specialty, …) restyled to AddServiceModal's label (`size.xs` / medium / `neutral700`, no opacity).
- **AddStaff layout pass** (follow-up): doctor fields now one **2-col grid** (equal columns — Reg. No. lines up under Experience; Medical Council no longer double-width); **icons removed** from Department/Specialty/Qualification/Medical Council/Reg. No.; labels tightened right above each input (`field` gap `2xs`). **Role block** restructured — "Role" + icon on the left, options in a **3-col grid** on the right (new `RadioGroup columns` prop), with space after the modal title.
- Verified: `tsc` clean, `npm run build` clean, Storybook screenshots (AddStaffModal grid + 3-col role; UploadModal centered header).
- Leftover (flagged, not done): NewPrescriptionModal's **Age** field is still a raw `<input>` (→ `Field`).

## Round 6 — overlays (cont.): ModalHeader, Radio, Overlays catalog

Reviewing the `Overview/Overlays` page modal-by-modal. Shipped:

- **New `ModalHeader`** (`components/ModalHeader/`) — canonical modal header: serif **h5** title (+ optional subtitle) + the canonical `IconButton` close (✕). `align="left"` (close right) / `align="center"` (close pinned top-right); omit `onClose` for no close. Story has all 4 variants. (Migrating the 6 standard-header modals onto it is the next step — not yet done.)
- **Modal default padding 32 → 24** (`spacing.xl`) — "24px on all sides" is now the standard for every modal that doesn't override. Full-bleed modals (BillModal, PrintPreviewModal, Pay Due) set padding 0 explicitly, so they're unaffected. Also shifts a few modals outside the review set (ImportData, Pharmacy add-stock, PrescriptionPage templates) to 24px.
- **Overlays overview completed** — added triggers for ConfirmDialog, AddServiceModal, EditPatientModal, NewPrescriptionModal (was missing). Added a `/api/doctors` MSW mock + `mockDoctors` so NewPrescriptionModal's doctor picker populates. Basic-Modal demo rebuilt on `ModalHeader` + real Buttons.
- **New `Radio` + `RadioGroup`** (`components/Radio/`) — fully custom radio (appearance:none) with a **neutral900 ring + dot** (the unchecked ring reads dark too, matching field icons — `accent-color` alone only tints the checked state). `options` take strings or `{label,value,color?,disabled?}` (per-option colour for the red "Waive"); `orientation`, group `disabled`. Story has gender / role / payment / disabled / column.
- **7 radio sites migrated** → `RadioGroup`: gender (StaffDetailsCard), role (AddStaffModal), payment (BillMedicinesModal, BillCard — disabled when paid), gender+type (BookAppointment), gender (NewPrescriptionModal). AddStaffModal's hand-rolled **"Other role" text input → `Field`** (matched the Specialty/Council "Other" inputs).
- **Dead code removed**: the `.dark-radio` global CSS (now owned by `Radio`) + the per-file `radioGroup`/`radioLabel`/`radioInput`/`genderGroup`/`radioRow`/`otherRoleInput` style objects across 6 files; trimmed now-unused imports.
- Verified: `tsc` clean, `npm run build` clean, Storybook renders (AddStaffModal role+gender, BillMedicinesModal payment-with-red-Waive screenshotted).
- Known leftovers (flagged, not done): NewPrescriptionModal's **Age** field is still a raw `<input>` (should be `Field`); BookAppointment `radioGroupInline`/`radioLabelSmall` styles are pre-existing dead; the 6 standard modals still hand-roll their header (ModalHeader migration pending).

## Round 5 — overlays / confirm dialogs

- **New shared `ConfirmDialog`** (`components/ConfirmDialog/`) — the one "are you sure?" dialog, built on `<Modal level="top">` (so it floats above whatever opened it). Props: `title`, `message?`, `confirmLabel`, `cancelLabel?`, `destructive?` (red confirm), `hideCancel?` (alert/single-button), `confirmDisabled?`. Story has Default / Destructive / Alert.
- **New Button `danger` variant** — solid red CTA (`red100` → `red200` hover), added to `Button.styles.ts` + the variant union. Powers `ConfirmDialog destructive`.
- **7 hand-rolled confirm overlays migrated** to `<ConfirmDialog>`, exact labels/handlers preserved:
  - Remove staff (AddStaffModal) → **red**; Cancel appointment (AppointmentQueue) → **red**; End session (SessionBar) → **red**.
  - Reset timer (SessionBar), Discard new-booking draft (HomePage), "Yes, add anyway" duplicate (BookAppointment) → **dark** (proceed/reset, not destructive).
  - Walk-in failed (HomePage) → **alert** (`hideCancel`, single OK).
- **`confirmStyles` deleted** from `AddStaffModal.styles.ts` + all four cross-folder imports removed (AppointmentQueue, SessionBar, HomePage, BookAppointment). Trimmed now-unused `zIndex`/`Button`/`radii` imports.
- **Z-index bug fixed** — AppointmentQueue's cancel confirm rendered at the bare `confirmStyles.overlay` z-index (1100, *below* other modals); via `ConfirmDialog`/`Modal level="top"` it's now 4100.
- **Pay Due popup → `Modal`** — the receipt popup (not a confirm) was borrowing `confirmStyles.overlay` as a backdrop; now wrapped in the canonical `<Modal level="top">` (transparent surface, no padding/radius/shadow; backdrop/esc-close off to keep its X/Cancel-only behaviour). No layout change.
- Verified: `tsc --noEmit` clean, `npm run build` clean (net +184 B), Storybook all three stories render. Judgment call to flag: **only remove/cancel/end are red**; reset-timer + discard-draft stay dark — say if you want those red too.

## Round 4 — buttons & chips

- **Chip/badge fonts → control** — `Tag` + `StatusBadge` moved from body `fonts.size.s` to `fonts.control.sm` (and Switch hint → `control.xs`), so chips/badges step with the control scale at <1440 (same fix as inputs). Button already used `--btn-fs`.
- **Token tidy** — Button border literal `1.5` → `strokes.s`; StatusBadge radius literal `"4px"` → `radii.xs`.
- **Overview "+" fixed** — the Buttons & Chips overview's IconButton demos used the weak `＋` glyph; now render the rotated-✕ (same as the IconButton Plus story), so "+" is legible + consistent.
- Left by decision: button **md-height stays 42** (sm already = input 40; forcing md→40 would collapse sm/md); **`secondary` button stays the always-green CTA** (doesn't theme-swap). Flag if you want either changed.

## Round 3 — input consistency pass

Audited every field (height / font / state colour / chevron / outline / fill) across both tiers. Shipped:
- **Legible clear ✕** — new shared `ClearButton` (1.5px stroke, neutral900 SVG, = the canonical close glyph). Replaces the tiny `×` in the combobox (`SuggestionInput`) and the browser's native search ✕ on pill-search (suppressed in globals).
- **Font tokens** — `Field` + `MeasureField` were on fluid *body* fonts (`fonts.size.*`); moved to *control* fonts (`fonts.control.*`) so all fields share the control scale (16→14 at <1440), matching `Select`.
- **Dead CSS** — repointed the stale `.fill-input` globals rules (FillInput is gone) to `.text-input-field`.
- Already consistent (no change): heights (`--input-h` 40/32; dense 28), fill (`primary100`), input placeholders (globally `neutral400`).

Decisions applied:
- **Chevron is now state-driven** (neutral300 idle → neutral900 open, matching Select; `SuggestionInput` updated, UnderlineSelect inherits it when it folds into Select).
- **Outline keeps the warm `primary300` border on pill/cream** (box stays `neutral300`) — confirmed, no change.
- **`TextInput` removed** — its 5 call sites repointed to `<Field variant="underline">`, component deleted. (Two files had a local `Field` helper, so they import it as `Field as TextField`.)

- **Filled placeholder → `alphaBlack3`** (translucent) on all filled inputs (Field / Select / SuggestionInput / MeasureField) via an `is-filled` class — the empty-state text now reads on the cream instead of a flat grey.
- **MeasureField** story reorganised to the matrix `(cream | box+prefix) × (unit-only | unit-switchable)` + `dense` shown as a size note. (with-unit vs dense = independent axes: unit = a chip, dense = 28px height.)

- **`UnderlineSelect` slimmed to chip-only** — the dead serif "underline" variant removed; it's now purely the inline chip dropdown (the booking title), with a state-driven chevron + control-font menu items. Kept as a small dedicated component (the chip is a distinct inline control, used once); a full fold into `Select` would over-generalise Select for a single caller, so not done.

**Input consolidation complete.** Deleted: FillInput, DosagePicker, TextInput. Merged: 4 dosing pickers → one `SuggestionInput`. Extended: `Field` (fill/align/list), `Select` (fill/chevron). Consistency: shared `ClearButton` (legible ✕), control fonts across all fields, state-driven chevron, alphaBlack3 filled-placeholder. UnderlineSelect slimmed.

## Round 2 — input / field family

### UnderlineSelect — chip text oversized in Storybook
- **Finding:** only the `chip` variant is used in the app (`BookAppointment`, passing `fontSize="var(--btn-fs)"`); the `underline` variant is **unused** (only the drift-doc gallery references it). The component default font was `h4` (a heading size), so the chip looked huge in Storybook while the app looked right (it overrode the size).
- **Fix:** `chip` now defaults to control text (`var(--btn-fs)` = 16px); the serif `underline` keeps `h4`. Callers can still override.
- **Fixed in:** `Input/UnderlineSelect/UnderlineSelect.tsx`. ✅ done, verified (16px), pushed.

### Unify the input + dropdown surface (decision: do A + B + C)
- **No Pay = owing** (your call) → `getPayStyle` now renders `"NO PAY"` as the warm "Due" colour (was grey), matching the badge.
- **Stage A ✅** — `Field` gains `fill: "outline" | "filled"` + `align` + `list`. Default `outline` ⇒ every existing field unchanged; box/pill can now be filled (cream, borderless).
- **Stage B ✅** — `FillInput` folded into `Field` (`variant="box" fill="filled"`) and **deleted**; Bill modal line items + the inputs overview repointed.
- **Stage C (in progress):**
  - ✅ `DosagePicker` deleted — 0 app usages (dead code). If dosage entry is needed later it's `<Select fill="filled">`.
  - ✅ `Select` extended with `fill` ("outline" | "filled") + `chevron` (on/off) — additive; its 9 existing usages are unchanged. Gives the outline/filled × chevron matrix.
  - ✅ The 4 prescription-pad pickers (Duration / Frequency / Interval / When) now share one `SuggestionInput` combobox (`src/components/Input/SuggestionInput/`). ~653 lines of duplicate shell → 159 (thin wrappers) + 253 (shared). Each picker's props are byte-identical, so `PrescriptionPage` is untouched. Verified: tsc 0; DurationPicker auto-format ("3"→3 Days/Weeks/…) + WhenPicker chevron list both render & select.
  - ⏳ Queued: remove `TextInput` (thin alias of `<Field variant="underline">` — 5 call sites) and `UnderlineSelect` (only the chip is used, in booking — fold into a Select pill, then delete). `MeasureField` keeps its behavior (its cream value box is conceptually a `Field` box-filled).
- Verified: tsc 0 errors, CRA build compiles, Storybook (Field surfaces + Bill modal) render correctly. Pushed.

## Round 1

### IconButton — "+" button
- **Observation:** the `+` in the Plus demo used a small `＋` character; looked weak next to the ✕.
- **Decision:** make `+` by rotating the canonical ✕ close glyph 45° (same stroke weight, no new icon).
- **Fixed in:** `IconButton/IconButton.stories.tsx` (the component is unchanged — reuses the built-in ✕). Pattern for the app: `<IconButton style={{ transform: 'rotate(45deg)' }} />`.
- **Status:** ✅ done, verified, pushed.

### StatusBadge — two "Booked" pills
- **Observation:** catalog showed two "Booked" badges.
- **Finding:** the backend emits **two status names — `BOOKED` and `SCHEDULED` — for the same pre-arrival state.** The badge already renders both as one "Booked" pill.
- **Decision:** keep both in the code (removing one would break live data), document `SCHEDULED` as an alias, and show "Booked" once in the catalog. (A true single name is a backend change — out of frontend scope.)
- **Fixed in:** `AppointmentQueue/StatusBadge.tsx` (comment), `StatusBadge.stories.tsx`, `ButtonsAndChips` overview.
- **Status:** ✅ done, verified, pushed.

### PayBadge — three look-alike states (Due / Unpaid / No Pay)
- **Observation:** three pay badges looked identical.
- **Finding:** `DUE`, `UNPAID`, `"NO PAY"` already rendered identically ("Due" + danger triangle).
- **Decision:** `DUE` is the single owing state; any non-paid value falls through to it. Zero visual change, simpler config; `PayStatusValue` narrowed to `"PAID" | "DUE"`.
- **Fixed in:** `AppointmentQueue/StatusBadge.tsx` (PAY_CONFIG + fallback + type), `PayBadge.stories.tsx`, `ButtonsAndChips` overview.
- **⚠️ Open question for you:** elsewhere (`AppointmentQueue.styles`) `"NO PAY"` is drawn as neutral grey — which would suggest it means **"no charge"**, not "Due". If "No Pay" should mean *no charge* (no warning), that's a separate small fix — tell me and I'll align it.
- **Status:** ✅ done (as Due), verified, pushed; semantic question above pending your call.
