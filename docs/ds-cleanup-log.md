# Design-system cleanup log

Running record of the component-by-component review (Storybook localhost:6006). Each entry: what was reviewed, the decision, and where it was fixed. Newest first.

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

Still open: `UnderlineSelect` removal (fold the booking chip → a `Select` pill, then delete) — the final item.

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
