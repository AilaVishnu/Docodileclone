# Docodile frontend — guidance for Claude

> The single source of truth for building UI here. **The design system is Storybook**
> (`npm run storybook`, port 6006) + the tokens in `src/styles/theme.ts` / `src/styles/globals.css`.
> Decisions history & rationale live in [`../docs/ds-cleanup-log.md`](../docs/ds-cleanup-log.md).

## 0. Prime directive — reuse the design system, never reinvent

Before building or styling **any** UI, find the component / variant / token that already does it.
Assume one exists — it usually does. Consistency is a hard requirement.

1. **Look first** — Storybook, `src/components/`, `theme.ts`. Assume it exists.
2. **Reuse** — use the existing component with its props/variants; pull every colour / size / spacing /
   radius / shadow from tokens.
3. **Extend before duplicating** — if it *almost* fits, add a prop/variant to the existing component.
   Never spin up a parallel component.
4. **Build new only if nothing fits** (or the user asks) — follow the folder convention **and** add a
   colocated `*.stories.tsx`. A new component without a story isn't done.
5. One-way ratchet: the library only gets *more* consistent. When in doubt, reuse.

**Never** hardcode a hex colour, px font-size, or ad-hoc spacing. **Never** import or inline a raw
`.svg`. Build "a form" by composing existing pieces — `Field` for inputs, `Button` for actions, text
from `fonts.*`, colours from `colors.*`, icons via `<Icon>` — all from the system.

## 1. Component inventory — reuse these

| Need | Use |
|------|-----|
| Text input (any) | **`Field`** — `variant` `underline` \| `box` \| `pill` (pill = search only) |
| Numeric/unit input | `MeasureField` |
| Dropdown / select | `Select`; inline chip dropdown `UnderlineSelect`; Rx pad pickers `SuggestionInput` |
| Button | **`Button`** (6 variants, §4); icon-only **`IconButton`** |
| Overlay / dialog | **wrap `Modal`** — never build a new backdrop. Header `ModalHeader`; yes/no `ConfirmDialog` |
| Toast | `Toast` |
| Table | **`DataGrid`** (+ shared `styles/tableStyles`) |
| Tabs | `Tabs` (`md` \| `sm`) |
| Card surface | `cardSurface(variant, elevation)` / `Card` |
| Radio | `Radio` / `RadioGroup` |
| Tag / badge | `Tag`, `StatusBadge`, `PayBadge` |
| Icon | **`<Icon name size tone>`** — the only way (§3) |
| Page chrome / patterns | `PageHeader`, `TopNav`, `SideNav`, `SessionBar`, `AppointmentQueue`, `Chat`, `DoctorSchedule` |
| Patient / date fields | `PatientDetailsForm`, `DateField`, `TimeField` |

Components live in `src/components/<Name>/` (named exports). Composite modals/cards (`AddStaffModal`,
`BillModal`, …) already wrap `Modal` — follow that pattern.

## 2. Tokens — read from these, never hardcode

- **`theme.ts`** — `colors`, `fonts` (`size` / `control` / weight), `spacing`, `radii`, `strokes`,
  `shadows` (`menu` / `modal` / `card`), `zIndex`, `icon` (`size` 24 / `sizeSmall` 20).
- **`globals.css`** — the `--fs-*` / `--lh-*` fluid type ramp, the `--active-shade-*` theme palette,
  and the per-page `--*` layout tokens (§5).
- **Theming:** `data-theme="secondary"` on a root element swaps `--active-shade-*`; use
  `colors.active.shade*` for theme-aware surfaces.
- **Styling pattern:** each component has a sibling `*.styles.ts` (React `CSSProperties`) consumed via
  inline `style`. No CSS modules, Tailwind, or styled-components.

## 3. Icons — never create one

- Use **`<Icon name=… size tone>`** only. ~80 icons live in `iconRegistry.ts`, normalized to
  `currentColor` so they recolour / disable / theme.
- **Do not create, add, or import a new `.svg`; do not inline an SVG.**
- **If a needed icon isn't in the registry: STOP and ask the user.** Never invent or add one.

## 4. Canon — decided rules (not obvious from a glance)

- **Buttons — 6 variants:** `primary · dark · secondary · primaryLight · secondaryLight · light`.
  Sizes `sm` 40/32, `md` 44/36 (1440+/compact). `secondary` is the always-green CTA (doesn't
  theme-swap). Disabled = grey (filled `neutral200`/`neutral500`/no stroke; outline `neutral400`).
- **Fields:** one `<Field>` (underline/box/pill); one invalid state — `red200` border + `redAlpha10`
  fill. Filled inputs use an `alphaBlack3` placeholder.
- **Dropdowns:** bordered warm panel — `neutral100` bg, `primary300` border, `radii.m`, `shadows.menu`,
  cream hover, `primary100` selected; canonical `ChevronDown` @16, state-driven colour.
- **Modals — 3 types:**
  | Type | Width | Surface | Title | Footer |
  |------|-------|---------|-------|--------|
  | Confirm | S 400 | white | centred | centred (light Cancel + dark Confirm) |
  | Form | M 480 / L 560 | white | left | right (light Cancel + primary Save) |
  | Workbench | XL 1040, `padding:0` | white | left/section | in-layout |
  Universal: `radii.2xl` (16), backdrop `rgba(0,0,0,.35)`, `shadows.modal`, close is **always**
  `<IconButton>` ✕ top-right, z from the scale (`modal` 4000 / `modalTop` 4100). **Width scale
  S 400 · M 480 · L 560 · XL 1040 — pick the nearest, don't invent.** Surface exceptions: AddStaff
  cream `primary100`; Bill & medicines `transparent` (torn-edge receipt); everything else white.
- **Cards:** one radius `radii.2xl` (16); three paper colours via `cardSurface` — `sage`
  (`secondary50`) = clinic, `cream` (`primary100`) = staff/queue, `surface` (white) = bills/stats.
  Clinic cards `raised` (soft `shadows.card`); others flat.
- **Tables:** spread `tableStyles` (`tableHeadCell` / `tableDivider`); status via `StatusBadge`.

## 5. Responsiveness — IMPORTANT (desktop, 1200–2560, split at 1440)

- **The browser never scrolls** — no horizontal scroll *anywhere*; vertical scroll lives only inside
  app regions (content under the header). Content that doesn't fit is the **layout's** job, not a
  scrollbar's. (Slack / Linear / Gmail shell.) Min supported width **1200px**; below it the page
  scrolls horizontally (unsupported tier).
- **Two tiers at 1440:** interval 2 = **1440+** (the `:root` defaults = the 1440 design); interval 1 =
  **1200–1439** (compact, the `@media (max-width:1439.98px)` block).
- **What steps down at <1440:** the **type scale** (headings drop one rung; body `m`=16 / `s`=14
  **hold**; `xs`=12 / `caption`=11 are the accessibility floor and hold) and the **universal controls**
  (search / button / input / tab heights & fonts). Per-screen *layout* tokens are single-tier until
  tuned screen-by-screen.
- **Never add ad-hoc media queries or hardcode sizes** — drive everything off the `--*` vars in
  `globals.css`. To tune a screen, add/adjust its `--<page>-*` token in **both** tiers.
- **Deep responsive work → use the `docodile-responsive` skill** (it owns the per-screen pass and the
  `--queue-*` / `--home-*` / `--topnav-*` / `--sidenav-*` / `--book-*` token groups).

### Per-page layout contract: fixed content block, stretchy gutters

Every page **centres a fixed-size content block and lets the gutters (or one gap) absorb width
changes.** When building or editing a screen, identify its fixed block + its stretch zone first and
keep that contract:

| Screen | Fixed (constant) | Absorbs the slack |
|--------|------------------|-------------------|
| Home | content cap `--home-content-max` (1356→1200) | side gutters stretch beyond the cap |
| TopNav | search bar `--topnav-search-w` (360→300) | empty space between search & the right action cluster |
| BookAppointment | 3 columns `--book-col-left/form/right` | side gutters stretch/squeeze |
| Prescription (Rx Pad) | container cap `--rx-content-max` (1120); vitals grid 6→5 cols at <1440 | left/right gutters |
| Today's Queue | side cards `--queue-side-w` (246); Name col caps `--queue-name-w` (256→200) | queue table width |
| SideNav | fixed 80px (no expand) | — |

## 6. Storybook conventions

- Stories are colocated (`src/components/<Name>/<Name>.stories.tsx`), CSF 3, `tags: ['autodocs']`.
  Controlled (`value`/`onChange`) components use a `render` with local state.
- Foundations, overview/consolidation pages, and shared mock infra (MSW handlers, mock data,
  decorators) live in `src/sb/`.
- Story files are **intentionally excluded** from the app `tsconfig.json` (keeps `npm run build`
  clean — Storybook compiles them via its own pipeline). Don't "fix" this.
