# Multi-tenant schema-per-clinic DB redesign

**Date:** 2026-06-20
**Status:** Draft for review
**Sub-project:** A of 3 (A: this DB rewrite + tenancy infra · B: unified login/onboarding · C: RBAC)

## Goal

Convert the backend from a `Tenant → Clinic → ClinicStaff → AppUser` multi-clinic model into a
**schema-per-clinic multi-tenant SaaS**, where each clinic is the tenant and owns a dedicated
Postgres schema (e.g. `tskin.app_user`, `tskin.patient`). Driver: **hard patient-data isolation**
and per-tenant data lifecycle (backup / export / delete one clinic independently).

Pre-launch, **no data migration** required — we rewrite the schema and consolidate the 51 Flyway
files into a clean baseline.

## Scope

**In scope (this spec):**
- New schema topology (control-plane `platform` + one schema per clinic).
- Consolidated Flyway: control-plane migrations + a tenant-template migration set.
- Hibernate `SCHEMA` multitenancy + per-request tenant resolution from subdomain.
- `ClinicProvisioningService` — atomically create a clinic: insert registry row → `CREATE SCHEMA`
  → run tenant migrations → seed admin user + `clinic_settings` + reference catalogs.
- Minimum auth wiring so a tenant-scoped login works: resolve tenant from subdomain, find
  `app_user` in that schema, issue a JWT bound to the tenant.
- Dev-mode tenant resolution (no real subdomains on localhost).
- The minimal frontend changes required so it **doesn't break** (see Frontend Impact).

**Deferred (later specs):**
- **B — Login UI & onboarding trigger:** single "Login" screen redesign, and *who* provisions a
  clinic (self-service signup vs. internal super-admin tool). This spec ships a provisioning
  *service* callable from a seed/CLI entry point; the user-facing trigger + auth gating is B.
- **C — RBAC:** fine-grained per-role feature access (Front Desk can't open Rx Pad / Patient Files).
  This spec keeps the existing role checks as-is.

## Schema topology

### `platform` (control-plane, shared) — routing only
A dedicated schema, read *before* we know the tenant; `public` is left unused.
- **`clinic`** (registry): `id`, `name`, `subdomain` (unique), `schema_name` (unique), `status`
  (`PROVISIONING` / `ACTIVE` / `SUSPENDED`), `created_at`. Maps `tskin.docodile.app` → schema `tskin`.
- **`clinic_provisioning`** (purpose-built): tracks schema creation + tenant migration state per
  clinic, so boot-time migration of all tenants is idempotent.
- Each tenant schema additionally carries its own `flyway_schema_history`.

> No clinic *profile* fields live here — only routing. Profile lives per-schema in `clinic_settings`.

### `<clinic_slug>` (per-clinic) — everything else
All domain tables, **with no `clinic_id`/`tenant_id` discriminator columns** (the schema *is* the
boundary):
`app_user`, `clinic_settings` (new, single row: name, address, logo, registration, speciality,
working hours, prescription letterhead), `patient`, `patient_ai_summary`, `patient_files`,
`appointment`, `visit`, `rx_row`, `rx_template`, `pharmacy_stock`, `service`, `print_template`,
`clinic_schedule`, `chat_messages`, `chat_last_seen`, `password_reset_token`, `suggestion`
(+ seeded dermatology catalogs: diagnoses, complaints, allergies, histories, tests).

**Entities removed:** `Tenant`, `ClinicStaff` (and its `ClinicStaffId`). `ClinicEntity` is reshaped
into the `platform.clinic` registry; clinic profile moves to per-schema `clinic_settings`.
`AppUser` loses its `tenant` FK — it's implicitly scoped by living in the clinic's schema.

## Flyway redesign

Replace 51 incremental files with **two locations**:

1. **`db/migration/control`** — applied once to `platform` at startup. Creates the registry + provisioning
   tables.
2. **`db/migration/tenant`** — the consolidated baseline (`V1__baseline.sql`) defining every per-clinic
   table + reference-data seeds. Applied to **each** tenant schema: at provisioning for new clinics,
   and at boot for existing ones. Each schema owns its own `flyway_schema_history`.

**Boot orchestration:** disable Spring Boot's single-schema auto-migrate; a `TenantMigrationRunner`
runs control migrations against `platform`, then iterates `platform.clinic` and runs the tenant
migration set (`flyway.schemas=<slug>`, `defaultSchema=<slug>`) against each. Idempotent.

**Reference/seed data** (dermatology catalogs) is seeded **per tenant** (into each clinic's schema),
so a clinic owns and can edit its own catalog. (Open decision #3 below if you'd prefer shared.)

## Tenant resolution & Hibernate wiring

- **`TenantContext`** — request-scoped `ThreadLocal<String schema>`.
- **`TenantResolutionFilter`** (servlet filter, runs early) — extracts the subdomain from the `Host`
  header → looks up `platform.clinic` (cached) → sets `TenantContext`. Rejects unknown/inactive subdomains.
- **Hibernate `SCHEMA` multitenancy** — `MultiTenantConnectionProvider` issues `SET search_path TO
  <schema>` on connection checkout and resets on release; `CurrentTenantIdentifierResolver` reads
  `TenantContext`. Control-plane lookups (clinic-by-subdomain, login) run against `platform`.
- **`CurrentUser.clinicId()`** and the per-service tenant scoping become **no-ops / removed** — the
  connection is already pinned to the right schema, so queries need no `WHERE clinic_id` filter.

## Authentication (minimum wiring; full UX in spec B)

- **Single login endpoint** `POST /auth/login` (email + password). Tenant comes from the **subdomain**,
  not a typed domain field. Drops the `/auth/staff/login` vs `/auth/login` admin/staff split and
  `switch-clinic`.
- Login looks up `app_user` in the subdomain's schema; issues a JWT with `sub`, `user_id`, `role`,
  `email`, and a **`tenant`/`schema` claim**.
- `JwtAuthenticationFilter` validates the token's `tenant` claim **matches** the request subdomain
  (prevents replaying clinic A's token against clinic B).
- `password_reset_token` and the setup-password flow operate inside the tenant schema.
- 1h-expiry / no-refresh and the broad copy-pasted `@PreAuthorize` lists are **left as-is** here
  (refresh tokens and RBAC are out of scope for this spec).

## Clinic provisioning (service only; trigger deferred to B)

`ClinicProvisioningService.create(name, subdomain, adminEmail, …)`:
1. Insert `platform.clinic` (`status=PROVISIONING`, `schema_name = slug(subdomain)`).
2. `CREATE SCHEMA <slug>`.
3. Run tenant Flyway against `<slug>`.
4. Insert admin `app_user` (role ADMIN, `PENDING_ACTIVATION`) + default `clinic_settings`.
5. Set `status=ACTIVE`; trigger admin password-setup email.

Failure handling: schema DDL can't share Flyway's transaction, so on any step failure **drop the
schema** and delete the registry row (compensating cleanup). Exposed for now via a **seed/CLI entry
point**; the public-facing onboarding trigger + its auth is spec B.

`slug()` rules: lowercase, `[a-z0-9_]`, must be a valid Postgres identifier, not a reserved word,
length-bounded, uniqueness enforced by `public.clinic.schema_name`.

## Dev-mode tenant resolution

`localhost` has no usable subdomain. Support, in order:
1. **`lvh.me`** (resolves to 127.0.0.1) — `tskin.lvh.me:3000` works in the browser with real subdomains.
2. **`X-Tenant` header** — for tests / API tools.
3. A configurable **default dev tenant** when neither is present.

## Frontend impact (keep it working; deeper UI in spec B)

- The clinic is now implied by the **host**, so `docodile_clinic_id` / `docodile_clinic_name`
  localStorage keys and anything that sends clinic id around become unnecessary. Login response no
  longer needs `clinicId`.
- **Remove** the admin clinic-switcher UI (`ClinicSelectionPage`, `switch-clinic`).
- **Login screen:** collapse to the single staff-style card, retitle to **"Login"**, drop the
  clinic-`domain` field (subdomain carries it). (Full redesign = spec B.)
- The ~15 hand-rolled `Bearer` fetches keep working as long as the frontend is served from the
  tenant subdomain (same host → API sees the right subdomain). Confirm the API base URL is
  same-origin / tenant-host.
- `DoctorStatusCard` / queue doctor list: unrelated to this spec, but note the earlier finding that
  the queue fetches doctors from an ADMIN-only endpoint — fold into spec C (RBAC).

## Risks / call-outs

- **Migration orchestration is custom infrastructure** we now own (multi-schema Flyway + runtime
  provisioning). Highest-effort piece; needs solid failure/rollback handling.
- **`search_path` hygiene:** must reset on connection return or a pooled connection leaks one tenant's
  scope into another's request. Critical correctness/security invariant — needs a test.
- **Cross-tenant/admin queries** (platform metrics, "list all clinics") must iterate schemas or read
  `platform` — no global `GROUP BY` anymore.
- **Connreuse:** verify Hibernate `SCHEMA` strategy + HikariCP play well (prepared-statement cache).

## Resolved decisions

1. **Control-plane schema:** dedicated **`platform`** schema; `public` left unused.
2. **Provisioning tracking:** purpose-built **`clinic_provisioning`** table in the `platform` schema.
3. **Reference catalogs (dermatology seeds):** **per-tenant** editable copy, seeded into each clinic
   schema on provisioning.
4. **Tenant identifier in JWT:** the **`schema_name`** (`tskin`) — directly usable to set `search_path`.

## Success criteria

- Two clinics can be provisioned (each its own schema, seeded admin + catalogs).
- `acme.docodile.app` and `tskin.docodile.app` each see only their own data; verified by an
  isolation test (a query under tenant A cannot read tenant B's rows).
- A single `/auth/login` works per subdomain; a JWT minted for clinic A is rejected on clinic B.
- Boot-time migration brings all existing tenant schemas to the latest tenant baseline, idempotently.
- Frontend loads and core flows (queue, Rx Pad, patients) work against a provisioned subdomain.
