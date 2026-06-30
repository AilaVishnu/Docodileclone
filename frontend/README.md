# Docodile frontend

React (Create React App) + TypeScript.

## Run

```bash
npm install
npm start            # app on http://localhost:3000
npm run storybook    # design system / component catalog on http://localhost:6006
npm run build        # production build
npx tsc --noEmit     # typecheck
```

## Building UI

**The design system is Storybook + the tokens in `src/styles/`.** Reuse existing components, styles,
and icons — don't reinvent. The rules, component inventory, canon, and responsiveness contract are in
**[`CLAUDE.md`](CLAUDE.md)** — read it before touching UI. Decision history lives in
[`../docs/ds-cleanup-log.md`](../docs/ds-cleanup-log.md).
