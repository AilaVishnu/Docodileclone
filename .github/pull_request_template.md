<!--
  Fill this in honestly. Standards: docs/contributing.md · Architecture: docs/architecture.md
  Keep PRs small and single-purpose.
-->

## What & why

<!-- What does this change do, and why? Link the issue / docs/backlog.md item it addresses. -->

## How to test

<!-- Steps a reviewer can follow to verify, plus what you tested. -->

## Definition of Done

- [ ] **Architecture-compliant** — upholds the invariants in `docs/architecture.md` §10; if the
      tenancy/auth/migration plumbing changed, `architecture.md` is updated in this PR.
- [ ] **Tested** — new behaviour has tests; bug fixes include a regression test (fails before, passes
      after). Tenancy/data-access changes prove isolation.
- [ ] **Builds & tests pass locally** (CI doesn't run the frontend checks):
  - [ ] `cd backend && ./gradlew test`
  - [ ] `cd frontend && npx tsc --noEmit`
  - [ ] `cd frontend && CI=false npx eslint src --ext .ts,.tsx` (no new warnings)
  - [ ] `cd frontend && CI=false npm run build`
- [ ] **Documented if non-trivial** — complex/new feature has a `docs/` page; `docs/backlog.md`
      updated if a gap was opened or closed.
- [ ] **Scoped & surgical** — diff traces to the stated goal; no unrelated refactors/formatting; no
      dead code introduced by this change.
- [ ] **Secure** — no secrets committed; auth stays fail-closed; any automated security-review finding
      is addressed or explicitly acknowledged below.

## Notes for reviewers

<!-- Trade-offs, follow-ups, security-review acknowledgements, anything non-obvious. -->
