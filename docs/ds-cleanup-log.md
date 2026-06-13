# Design-system cleanup log

Running record of the component-by-component review (Storybook localhost:6006). Each entry: what was reviewed, the decision, and where it was fixed. Newest first.

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
  - ⏳ Next: consolidate the 4 prescription-pad pickers (Duration / Frequency / Interval / When) onto a shared combobox primitive — keeping their type-ahead + external API so `PrescriptionPage` is untouched — then fold the booking chip.
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
