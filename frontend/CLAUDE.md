# Docodile frontend — guidance for Claude

## Design system: REUSE, don't reinvent

This app has a complete component library and a token system. **Before building or styling ANY UI, reuse what already exists. Do not invent new components, colours, spacing, radii, or type sizes unless the user explicitly asks or nothing existing fits.** Consistency is a hard requirement here.

**The source of truth is Storybook** — run `npm run storybook` (port 6006). It catalogs every component plus the Foundations (Colours, Typography, Spacing, Radii & Strokes, Elevation, Icons). Browse it (or `src/components/` + `src/styles/theme.ts`) before writing UI. Past design decisions are logged in **`docs/ui-decisions.md`** — read it when a styling/structure question comes up.

### The discipline — follow it EVERY time you touch UI
1. **Look first.** Find the component / variant / token that already does what you need (Storybook, `src/components/`, `theme.ts`). Assume one exists — it usually does.
2. **Reuse it.** Use the existing component with its props/variants; pull every colour / size / spacing / radius from `theme.ts` tokens. Never hardcode a hex, px font size, or ad-hoc spacing, and never import a raw `.svg` (use `<Icon name=…>`).
3. **Extend before duplicating.** If it *almost* fits, add a variant/prop to the existing component (e.g. a new `Field` variant, a `Button` variant) — do **not** spin up a parallel component.
4. **Build new only if nothing fits** (or the user explicitly asks). Then follow the folder convention AND add a colocated `*.stories.tsx` so the new piece enters the catalogue and the next session reuses it too. A new component without a story doesn't count as done.
5. This is a one-way ratchet: the library should only get *more* consistent over time, never sprout duplicates. When in doubt, reuse.

### Use the existing building blocks
- **Components** live in `src/components/<Name>/` (named exports). Key ones: `Icon` (**the one icon — `<Icon name="…" size tone>`; every icon comes from the registry, never import an `.svg` directly**), `Button`, `IconButton`, `Card`, `Field` (the canonical text input — underline/box/pill), `Select`, `Tag`, `Switch`, `Tabs`, `Modal` (**the one overlay shell — wrap it, never build a new modal/backdrop**), `Toast` (the one toast), `DataGrid`, `PageHeader`, `PopoverMenu`, the `*Picker`s, `charts/*`, and Patterns (`TopNav`, `SideNav`, `SessionBar`, `Chat`, `AppointmentQueue`, `DoctorSchedule`). Composite cards/modals (`UploadModal`, `AddStaffModal`, `BillModal`, …) already wrap `Modal` — follow that pattern.
- **Design tokens** are in `src/styles/theme.ts` (`colors`, `fonts`, `spacing`, `radii`, `strokes`, `shadows`, `zIndex`) and `src/styles/globals.css` (the `--fs-*`/`--lh-*` fluid type ramp, the `--active-shade-*` theme palette). **Always read from tokens** — never hardcode hex colours, px font sizes, or ad-hoc spacing. Use `fonts.size.*`, `colors.*`, `spacing.*`, `radii.*`, etc.
- **Theming:** primary/secondary themes swap via `data-theme="secondary"` on a root element (drives `--active-shade-*`). Use `colors.active.shade*` for theme-aware surfaces.
- **Styling pattern:** each component has a sibling `*.styles.ts` (React `CSSProperties` objects) consumed via inline `style`. No CSS modules, Tailwind, or styled-components.
- **Responsive scope:** desktop-only (1200–2560, baseline 1440). Sizes are CSS-variable driven and step at 1440 — don't add ad-hoc media queries; follow `globals.css`.

### If you genuinely need something new
1. Re-check Storybook, `src/components/`, and `theme.ts` first — extend/compose before duplicating (e.g. wrap `Modal`, add a `Field` variant).
2. If it's truly new, match the folder convention: `Name/Name.tsx` + `Name.styles.ts` + `index.ts`, build it from tokens, and add a colocated `Name.stories.tsx` so Storybook stays the source of truth.

## Storybook conventions
- Stories are colocated (`src/components/<Name>/<Name>.stories.tsx`), CSF 3, `tags: ['autodocs']`. Controlled (`value`/`onChange`) components use a `render` with local state.
- Foundations docs, the Overview/consolidation pages, and shared mock infra (MSW handlers, mock data, decorators) live in `src/sb/`.
- Story files are **intentionally excluded** from the app `tsconfig.json` (Storybook's types don't resolve under CRA's `moduleResolution: "node"`). Don't "fix" this — it keeps `npm run build` clean. Storybook compiles stories via its own pipeline.
