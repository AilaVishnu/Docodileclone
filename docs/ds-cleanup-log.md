# Design-system cleanup log

Running record of the component-by-component review (Storybook localhost:6006). Each entry: what was reviewed, the decision, and where it was fixed. Newest first.

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
