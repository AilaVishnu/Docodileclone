# Contributing & Development Standards

> How we ship changes to Docodile without regressing quality or breaking tenant isolation.
> Read this once before your first PR; use the **Definition of Done** checklist on every PR.
>
> Companion docs: `docs/architecture.md` (how the system works — especially multi-tenancy),
> `docs/backlog.md` (outstanding work), `memory-bank/` (project context for AI assistants).
> Last updated: 2026-06-28.

---

## The one rule that matters most

**Tenant isolation is a safety property, not a feature.** A bug that leaks one clinic's patient data
into another is the worst thing this codebase can do. Before changing anything that touches data
access, authentication, migrations, background jobs, or WebSockets, **re-read
`docs/architecture.md` §3–7 and the invariants in §10**, and make sure your change upholds them.
If you can't tell whether your change is tenant-safe, ask in the PR before merging.

---

## Definition of Done

A change is "done" only when **all** of these are true. The PR template
(`.github/pull_request_template.md`) restates this as a checklist — fill it in honestly.

- [ ] **Architecture-compliant.** Nothing in `docs/architecture.md` §10 (Invariants) is violated.
      If the change alters the tenancy/auth/migration plumbing, `architecture.md` is updated in the
      same PR.
- [ ] **Tested.** New behaviour has tests; fixed bugs have a regression test that fails before the
      fix and passes after. See **Testing standards** below.
- [ ] **Builds and tests pass locally** — backend *and* frontend (see **Local verification**). CI
      does not run the frontend typecheck/lint, so that's on you.
- [ ] **Documented if non-trivial.** A functionally or technically complex/new feature gets a short
      doc under `docs/` (see **When to write a doc**). `docs/backlog.md` is updated if you opened or
      closed a known gap.
- [ ] **Scoped & surgical.** The diff traces to the stated goal — no drive-by refactors, no
      unrelated formatting churn, no dead code left behind that your change created.
- [ ] **Secure.** No secrets committed; auth stays fail-closed; the automated commit security review
      (see **Security**) is addressed or explicitly acknowledged.

---

## Workflow

1. **Branch** off `main` (or the current integration branch). Never commit straight to `main`.
2. **Keep PRs small and single-purpose.** A reviewer should hold the whole change in their head. If
   it spans subsystems, split it.
3. **Commit messages:** `area: imperative summary`, e.g. `tenancy: run scheduled jobs per clinic`,
   `frontend: clear safe lint warnings`. Body explains *why*, not just *what*. Group related edits
   into one logical commit rather than a stream of "fix" commits.
4. **Open a PR** with the template filled in. Link the issue/backlog item it addresses.
5. **Green before review:** don't request review until local build + tests pass.

---

## Architecture compliance

`docs/architecture.md` is the source of truth for how the system fits together. The invariants you
must not break (full list + rationale in §10) — in short:

- Never name a schema in application code; route through `TenantContext`.
- Always pair `TenantContext.set()` with `clear()` (prefer `withTenant {}`).
- All clinic-data access goes through JPA/Hibernate (so `search_path` is set); the registry is the
  only plain-JDBC exception.
- Background/scheduled work goes through `TenantTaskExecutor.forEachActiveClinic`.
- JWTs stay clinic-bound and auth stays fail-closed (`schema == TenantContext.get()`).
- Enforce tenancy on WebSocket **SUBSCRIBE**, not just publish.
- Change `db/tenant/V1__baseline.sql` (or a new `db/tenant/V2__…`), never the legacy `db/migration/`.

**If your change makes one of these statements no longer true, the architecture doc must change in
the same PR** — otherwise the doc lies and the next developer trusts it.

---

## Testing standards

> Tests are how we go fast safely. A change without tests is a change we can't refactor later.

**What to test**
- New endpoints/services: the happy path plus the failure/edge cases (validation, auth, empty input).
- Bug fixes: a regression test that reproduces the bug (fails before, passes after).
- **Anything touching tenancy/auth: prove isolation.** If you add a data-access path, it must not be
  reachable cross-tenant. Where practical, add/extend an integration test that runs under two
  schemas and asserts data written under one is invisible to the other. (This ORM-level isolation
  test is itself a tracked backlog item — `docs/backlog.md` §2.1 — extend it as you go.)

**Where tests live & which kind to use** (`backend/src/test/kotlin/...`)
- **Unit / Mockito** (`@ExtendWith(MockitoExtension::class)`) — pure logic, services with mocked
  collaborators. Fast, no DB. Example: `service/NoShowSweepJobTest.kt`.
- **Slice tests** (`@WebMvcTest`, `@DataJpaTest`) with the `test` profile
  (`src/test/resources/application-test.yml`) — controllers/repositories in isolation.
- **Testcontainers (real Postgres)** — anything that depends on real schema semantics: migrations,
  provisioning, `search_path` routing, tenant isolation. Extend **`PgContainerTest`**
  (spins up `postgres:16`, exposes a `HikariDataSource`, no Spring context). Examples:
  `tenancy/ClinicProvisioningServiceTest.kt`, `tenancy/SchemaMultiTenantConnectionProviderTest.kt`.
  Use a real Postgres (not H2) whenever Postgres-specific behaviour matters — H2 won't catch a
  `search_path` bug.

**Frontend**
- Keep it typecheck- and lint-clean (`tsc --noEmit`, `eslint`). New components get a colocated
  `*.stories.tsx` (see **Frontend** below). Add unit tests where logic warrants it.

---

## Local verification (run before every PR)

CI runs **only** the backend tests and the two builds (`.github/workflows/test.yml` →
`./gradlew test`; `deploy.yml` → backend `./gradlew build -x test`, frontend `npm run build`), on
**JDK 17**. CI does **not** run `tsc`, ESLint, or any frontend tests — so a frontend regression sails
through CI. **Run the full set locally:**

```bash
# Backend — must be green (needs Docker running for Testcontainers tests)
cd backend && ./gradlew test

# Frontend — all three; CI won't catch these for you
cd frontend && npx tsc --noEmit
cd frontend && CI=false npx eslint src --ext .ts,.tsx     # don't add new warnings
cd frontend && CI=false npm run build
```

Match CI's JDK (17). If you touched the tenancy/migration code, also do a quick `./gradlew bootRun`
smoke (needs Postgres + `JWT_SECRET`) to confirm the app boots and migrations apply — boot is where
schema/migration mistakes surface that unit tests miss.

---

## When to write a doc

If a feature is **functionally or technically complex, or introduces a new pattern**, add a short
doc under `docs/` so the next person doesn't reverse-engineer it. Triggers:

- A new cross-cutting mechanism or pattern (like tenancy, the audit pipeline, provisioning).
- Non-obvious design decisions, trade-offs, or "why it's done this weird way" reasoning.
- Anything a teammate would otherwise have to read 5+ files to understand.

**What a feature doc should contain:** the problem it solves, the approach and *why* (alternatives
rejected), the key files/flow, how to test/verify it, and any gotchas. Keep it tight — a page is
usually enough. Link it from `docs/architecture.md` if it's part of the core architecture, and add a
"Last updated" line. **Don't** write a doc for routine CRUD that the code already makes obvious — a
doc that restates the code rots and misleads.

Also: when you finish a backlog item, move it to the **Done** section of `docs/backlog.md` with its
commit SHA; when you discover a new gap, add it.

---

## Frontend: reuse the design system

The frontend has a complete component library and a token system (`src/components/`,
`src/styles/theme.ts`, browsable in Storybook). **Reuse before you build.** Don't hardcode hex
colours, px font sizes, ad-hoc spacing, or import raw `.svg`s — pull from tokens and use `<Icon>`.
Extend an existing component (add a prop/variant) before duplicating one. A new component isn't
"done" without a colocated `*.stories.tsx`. The full discipline is in `frontend/CLAUDE.md` — read it
before touching UI.

---

## Security

- **Never commit secrets.** `JWT_SECRET`, DB passwords, `FILE_ENCRYPTION_KEY`, SMTP creds come from
  the environment. `.env.local` is gitignored — keep it that way.
- **Auth stays fail-closed.** Don't "relax" the JWT schema check or a permission gate to make
  something work; fix the actual cause. Cross-tenant access must be impossible, not just unlikely.
- **Automated commit review.** A security review runs on commits and may flag findings. Address each,
  or explicitly note in the PR why it doesn't apply (e.g. the behaviour was an intentional, agreed
  decision). Don't silently ignore a flagged regression.
- **Validate at the boundary.** Schema names, file uploads, and any user input that reaches SQL/DDL
  or the filesystem must pass through the existing validation gates (e.g. provisioning `slug()`),
  never string-interpolated.

---

## Quick reference

| I'm about to… | First read | Then |
|---------------|-----------|------|
| Touch data access / a repository | `architecture.md` §3–4, §10 | Add a test that proves tenant scoping |
| Add a `@Scheduled` job | `architecture.md` §7 | Route through `TenantTaskExecutor` |
| Change the DB schema | `architecture.md` §6 | Edit `db/tenant` baseline (+ test via `PgContainerTest`) |
| Touch auth / JWT / WebSocket | `architecture.md` §5 | Keep fail-closed; add a security test |
| Build UI | `frontend/CLAUDE.md` | Reuse components/tokens; add a story |
| Ship a complex feature | this doc → *When to write a doc* | Add a `docs/` page |
