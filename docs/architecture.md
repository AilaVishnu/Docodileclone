# Docodile — Architecture Guide

> Audience: developers new to the codebase. This document explains the overall system and, in
> depth, the **schema-per-clinic multi-tenant** architecture — the single most important thing to
> understand before changing anything that touches data access.
>
> Last updated: 2026-06-28. Keep this current when the tenancy plumbing changes.
> Companion docs: `docs/backlog.md` (outstanding work),
> `docs/superpowers/specs/2026-06-20-multitenant-schema-per-clinic-db-redesign.md` (the redesign spec).

---

## 1. What Docodile is

A clinic-management SaaS. Each **clinic** is an independent tenant with its own subdomain
(`acme.docodile.app`) and its own isolated set of data. The product covers appointments/queue,
patient records, the prescription ("Rx") pad, visits, billing, pharmacy stock, staff/RBAC, chat,
stats, and data-protection workflows (consent, deletion/correction requests, audit).

### Stack

| Layer | Technology |
|-------|-----------|
| Backend | Kotlin, Spring Boot 4.x, Spring Security, Spring Data JPA / Hibernate 7.x |
| Database | PostgreSQL (one database, **many schemas** — see §3) |
| Migrations | Flyway, driven **programmatically** (not Spring's auto-Flyway) |
| Auth | Stateless JWT (HS256), Argon2 password hashing |
| Realtime | STOMP over WebSocket (SockJS endpoint `/ws`) |
| Frontend | React (Create React App), TypeScript |

### Repo layout

```
backend/   Spring Boot app
  src/main/kotlin/com/example/docodile/
    tenancy/   ← multi-tenant plumbing (READ THIS FIRST)
    security/  ← JWT, filters, principal, rate limiting
    config/    ← Spring wiring (Hibernate MT, security, CORS, WebSocket)
    web/       ← REST + STOMP controllers
    service/   ← business logic
    repo/      ← Spring Data repositories
    domain/    ← JPA entities + enums
  src/main/resources/
    db/control/   ← Flyway migrations for the `platform` (control-plane) schema
    db/tenant/    ← Flyway migrations for each per-clinic schema (V1__baseline.sql)
    db/migration/ ← LEGACY single-DB migrations (NOT executed — see §6)
    application.yml
frontend/  React app
  src/
    tenant.ts          ← derive the clinic slug from the subdomain
    apiInterceptor.ts  ← inject the X-Tenant header on every API call
    apiConfig.ts       ← API_BASE_URL
docs/      this guide, the backlog, the redesign spec, UI decisions
```

---

## 2. Big picture

```
 Browser (acme.docodile.app)
        │  fetch() → global interceptor adds  X-Tenant: acme
        ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ Spring Boot                                                        │
 │                                                                    │
 │  TenantResolutionFilter   (very first filter, order HIGHEST+10)    │
 │     subdomain / X-Tenant → platform.clinic lookup → TenantContext  │
 │        │                                                           │
 │        ▼                                                           │
 │  Spring Security chain                                             │
 │     RateLimitFilter → JwtAuthenticationFilter                      │
 │        (JWT must carry schema == TenantContext, else unauthenticated)│
 │        │                                                           │
 │        ▼                                                           │
 │  Controller → Service → JPA repository                            │
 │        │                                                           │
 │        ▼                                                           │
 │  Hibernate multi-tenancy                                           │
 │     SchemaTenantResolver reads TenantContext                       │
 │     SchemaMultiTenantConnectionProvider sets search_path=<schema>  │
 │        │                                                           │
 └────────┼───────────────────────────────────────────────────────────┘
          ▼
 PostgreSQL (one DB)
   platform.*        ← control plane: clinic registry
   acme.*            ← clinic "acme" data (app_user, patient, appointment, …)
   tskin.*           ← clinic "tskin" data
   …
```

Everything downstream of `TenantContext` is automatically scoped to one clinic's schema. Application
code (services, repositories) is **tenant-agnostic** — it never names a schema. That is the whole
point: business logic stays simple, isolation is enforced by the plumbing.

---

## 3. The tenancy model: schema-per-clinic

### 3.1 Why this model

We chose **schema-per-tenant** (one Postgres schema per clinic) over a shared schema with a
`clinic_id` discriminator column. The driver was **patient-data isolation**: a missing `WHERE
clinic_id = ?` in shared-schema designs silently leaks one clinic's patients to another. With
schema-per-tenant, isolation is enforced at the connection's `search_path`, not by remembering a
filter on every query. The trade-off (more schemas to migrate, provisioning complexity) is accepted
and handled by the plumbing below.

### 3.2 Two kinds of schema

1. **`platform`** — the **control plane**. Exactly one. Holds the clinic registry and provisioning
   audit. It is *not* a tenant; it has no patient data. Tables (`db/control/V1__platform_schema.sql`):
   - `platform.clinic` — the registry: `(id, name, subdomain, schema_name, status, created_at)`,
     with unique `subdomain` and unique `schema_name`. `status ∈ {PROVISIONING, ACTIVE, SUSPENDED}`.
   - `platform.clinic_provisioning` — per-step provisioning audit trail.
2. **Per-clinic schemas** (`acme`, `tskin`, …) — one per clinic. Each contains the **full
   application data model**, identical structure, defined by `db/tenant/V1__baseline.sql`. The schema
   name equals the clinic's slug (see §6.4).

The registry is the **only** place that maps `subdomain → schema_name`. It is read on every request.
It is accessed with **plain JDBC** (`ClinicRegistryDao`), never JPA — because it lives outside any
tenant and must be reachable regardless of the current `search_path`.

### 3.3 `TenantContext` — the request-scoped tenant holder

`tenancy/TenantContext.kt` is a `ThreadLocal<String?>` holding the current request's **schema name**.

```kotlin
object TenantContext {
    fun set(schema: String?)
    fun get(): String?
    fun clear()
    inline fun <T> withTenant(schema: String, block: () -> T): T  // set → block → clear (finally)
}
```

- One servlet request = one thread, so a ThreadLocal is the right scope.
- **It MUST be cleared in a `finally`** or a pooled thread leaks the previous request's tenant into
  the next one. Every place that sets it does so with a matching clear (the filter's `finally`, or
  `withTenant {}`). If you ever call `set()` directly, you own the `clear()`.

---

## 4. How a request becomes tenant-scoped (the full chain)

### 4.1 Frontend: subdomain → `X-Tenant` header

Backend and frontend are cross-origin in dev, so the browser's `Host` header can't be relied on to
carry the tenant. Instead the SPA derives the clinic slug from **its own hostname** and sends it as
an explicit header.

- `frontend/src/tenant.ts` → `currentTenant()`:
  - `acme.docodile.app` → `"acme"`; `acme.lvh.me` / `acme.localhost` → `"acme"` (dev).
  - Plain `localhost` (no subdomain) → falls back to `process.env.REACT_APP_DEV_TENANT`.
  - Reserved labels (`www`, `api`, `app`, `localhost`) → `null`.
- `frontend/src/apiInterceptor.ts` → `installApiInterceptor()` wraps `window.fetch` **once** (called
  from `src/index.tsx`) and adds `X-Tenant: <slug>` to every request whose URL starts with
  `API_BASE_URL`. The ~100 hand-rolled `fetch` call sites are untouched — the wrapper is global.

### 4.2 Backend: `TenantResolutionFilter` populates `TenantContext`

`tenancy/TenantResolutionFilter.kt`, registered by `config/TenantFilterConfig.kt` as a
`FilterRegistrationBean` at `order = HIGHEST_PRECEDENCE + 10`, `urlPatterns = /*`. It therefore runs
**before the Spring Security filter chain**, so the tenant is known by the time auth runs.

Per request it:
1. Lets `OPTIONS` (CORS preflight) pass untouched — preflights carry no `X-Tenant`.
2. Resolves the subdomain: **`X-Tenant` header wins**; otherwise the first DNS label of a known base
   domain (`.docodile.app`, `.lvh.me`, `.localhost`).
3. Looks up `platform.clinic` by subdomain. If found **and `status == ACTIVE`**, sets
   `TenantContext = clinic.schema_name`.
4. **Fail-closed routing:** if no tenant resolved and the path is tenant-scoped, returns
   `400 {"error":"Unknown or missing clinic"}`. Only `/actuator`, `/api/health`, `/ws` are exempt
   (`isTenantScopedPath`). Note `/auth/login` is **not** exempt — login is always clinic-scoped.
5. `finally { TenantContext.clear() }`.

### 4.3 Hibernate: schema switching on the JDBC connection

Wired in `config/MultiTenancyConfig.kt` (a `HibernatePropertiesCustomizer`) which registers two
components with Hibernate's `MULTI_TENANT_*` settings:

- **`SchemaTenantResolver`** (`CurrentTenantIdentifierResolver<String>`):
  `resolveCurrentTenantIdentifier() = TenantContext.get() ?: "public"`. The `public` fallback is for
  non-request threads (startup). `validateExistingCurrentSessions() = true` so Hibernate refuses to
  reuse a Session bound to a different tenant.
- **`SchemaMultiTenantConnectionProvider`** (`MultiTenantConnectionProvider<String>`): one shared
  Hikari `DataSource`. On **checkout** for a tenant it runs:

  ```sql
  SELECT set_config('search_path', ?, false)   -- ? = schema name, bound as a string
  ```

  This is **parameterized** — the schema name is a bound value, never interpolated into SQL, so there
  is no injection sink even if an unvalidated name reached here. On **release** it runs
  `RESET search_path` before the connection returns to the pool; if the reset fails it `abort()`s the
  connection so the pool discards it rather than hand a mis-scoped connection to the next borrower.

**The critical invariant:** a connection's `search_path` must be set on checkout and reset on
release. Borrow-without-set or release-without-reset = cross-tenant leakage. This is why we never
hand out raw pooled connections that bypass this provider.

### 4.4 End-to-end sequence

```
Browser            TenantResolutionFilter      JwtAuthFilter        Hibernate / PG
  │  GET /api/patients  │                          │                    │
  │  X-Tenant: acme     │                          │                    │
  │  Bearer <jwt>       │                          │                    │
  ├────────────────────►│ lookup platform.clinic   │                    │
  │                     │ TenantContext = "acme"    │                    │
  │                     ├─────────────────────────►│ jwt.schema=="acme"?│
  │                     │                          │ yes → authenticate │
  │                     │                          ├───────────────────►│ checkout conn
  │                     │                          │                    │ set_config(search_path,'acme')
  │                     │                          │                    │ SELECT … FROM patient
  │                     │                          │                    │ RESET search_path (release)
  │◄────────────────────┤ TenantContext.clear()    │                    │
```

---

## 5. Authentication & tenant binding (security)

Auth and tenancy are deliberately coupled: **a JWT is bound to one clinic schema**, and that binding
is re-checked on every request. This stops a token minted for clinic A from being replayed against
clinic B's subdomain.

### 5.1 The `schema` JWT claim

`security/TokenService.kt#generateToken(userId, schema, role, email)` puts these claims on the token:
`user_id`, **`schema`**, `role`, `email`. At login (`service/AuthService.kt#login`) the `schema` is
taken from `TenantContext.get()` — i.e. the clinic the login request came in on. The user lookup
itself is already scoped to that schema by Hibernate multi-tenancy, so you can only log into the
clinic whose subdomain you used.

### 5.2 `JwtAuthenticationFilter` — fail closed

`security/JwtAuthenticationFilter.kt` runs inside the Spring Security chain (added before
`UsernamePasswordAuthenticationFilter`). It authenticates a request **only if**:

```
role != null && userId != null && schema != null
&& schema == TenantContext.get()        // token's clinic == request's clinic
&& no existing authentication
```

A token with no `schema` claim, a request whose tenant didn't resolve, or a `schema ≠ subdomain`
mismatch (cross-tenant replay) is **left unauthenticated** → Spring Security then 401/403s any
protected endpoint. It also rejects:
- tokens whose session was revoked (`user_session.revoked_at` via `jti`),
- `mfa_pending` tokens anywhere except `/auth/mfa/complete`.

### 5.3 Spring Security config

`config/SecurityConfig.kt`: stateless (no server sessions), CSRF disabled (token auth), method
security on (`@PreAuthorize` for RBAC). Public endpoints: the `/auth/*` login/MFA/password set,
`/actuator/health`, `/api/health`, `/ws/**`, and all `OPTIONS`. Everything else requires
authentication. Password hashing is Argon2.

### 5.4 CORS for subdomains

Because every clinic is a distinct origin, CORS uses **origin patterns** (not fixed origins), which
is also required alongside `allowCredentials = true`. Defaults:
`http://localhost:3000/3001`, `https://*.docodile.app`, `http://*.lvh.me:3000`; override with the
`ALLOWED_ORIGINS` env var (comma-separated). Allowed headers include `Authorization` and **`X-Tenant`**.

### 5.5 WebSocket tenancy

STOMP over `/ws` (SockJS). `config/WebSocketSecurityConfig.kt` installs `TenantChannelInterceptor` on
the inbound channel:
- **CONNECT:** reads the `Authorization` STOMP header, validates the JWT, and binds an
  `AppUserPrincipal` (carrying the `schema`) to the WebSocket session.
- **Per frame:** sets `TenantContext` to the principal's schema so any DB work in STOMP handlers is
  scoped; clears it in `afterSendCompletion`.
- **SUBSCRIBE isolation:** the in-memory STOMP broker isolates topics only by **name**, so a user
  from clinic A could otherwise subscribe to clinic B's `/topic/clinic/{schemaB}`. The interceptor
  **rejects** any `SUBSCRIBE` to a `/topic/clinic/*` destination whose schema segment ≠ the connected
  user's schema (fail closed: unauthenticated / mismatched / widened path → `MessageDeliveryException`).
- Group chat is published to a **per-schema** topic `/topic/clinic/{schema}` (`web/ChatController.kt`)
  for the same reason.

---

## 6. Migrations & provisioning

### 6.1 Two migration sources, run programmatically

Spring Boot's auto-Flyway is **disabled** (`spring.flyway.enabled: false` in `application.yml`). We
run Flyway ourselves via the Java API (`tenancy/TenantMigrator.kt`) because we need per-schema
targets:

- `migrateControlPlane()` → applies `classpath:db/control` to the `platform` schema.
- `migrateTenant(schema)` → applies `classpath:db/tenant` to one clinic schema, each schema owning
  its own `flyway_schema_history`. Uses `baselineOnMigrate(true)` so a schema that already has tables
  but no Flyway history (a dev-seeded or interrupted-provisioning schema) is baselined rather than
  failing the whole boot.

> **`db/migration/` (V1…V61) is LEGACY** — the old single-database model. It is **not executed**
> (auto-Flyway is off and `TenantMigrator` points at `db/control` + `db/tenant`). It's retained for
> history. The authoritative per-clinic schema is **`db/tenant/V1__baseline.sql`**. When you add a
> column/table for clinics, you change the tenant baseline (pre-release: edit the baseline directly;
> post-release: add `db/tenant/V2__…`).

### 6.2 Boot-time migration

`tenancy/TenantBootMigrationRunner.kt` (an `ApplicationRunner`, `@Order(0)`):
1. `migrateControlPlane()`.
2. For each `ACTIVE` schema in the registry, `migrateTenant(schema)`.

Per-tenant migration failure is **intentionally fatal** — a partial boot (some tenants migrated, some
silently stale) is worse than failing loudly. Don't wrap this in a blanket try/catch without
designing a degraded mode first.

### 6.3 Provisioning a clinic

`tenancy/ClinicProvisioningService.kt#provision(name, subdomain, adminEmail)` does it atomically via a
**compensating transaction** (CREATE SCHEMA + Flyway can't share one DB transaction):
1. insert `platform.clinic` row with status `PROVISIONING`,
2. `CREATE SCHEMA "<slug>"`,
3. `migrator.migrateTenant(slug)` (baseline),
4. seed `clinic_settings` + an admin `app_user` (role `ADMIN`, `account_status = PENDING_ACTIVATION`)
   — the seed uses `SET search_path` then **resets it** in a `finally`, same pool-hygiene rule as §4.3,
5. mark the registry row `ACTIVE`.

On **any** failure it drops the schema and deletes the registry row. If the JVM dies mid-provision the
cleanup may not run, leaving a `PROVISIONING` row with a partial schema — an accepted rare gap,
recovered manually. **Known gap:** `provision()` currently has **no HTTP caller** — see
`docs/backlog.md` §1.1.

### 6.4 Slug validation — the single safety gate

`provision()` slugifies the subdomain into a safe Postgres identifier and is the **one** validation
point protecting `migrateTenant`/`CREATE SCHEMA` from unsafe names:
- lowercase, `[^a-z0-9_]` → `_`, length ≤ 63, must start with a letter,
- not in `RESERVED = {platform, public, pg_catalog, information_schema, tenant}`.

(`tenant` is reserved defensively because the legacy single-DB model had a `public.tenant` table.)
Schema names entering `SchemaMultiTenantConnectionProvider` are additionally only ever passed as a
**bound parameter** to `set_config`, never interpolated.

---

## 7. Background & scheduled jobs

Scheduled jobs run on a scheduler thread with **no HTTP request**, hence **no `TenantContext`** — so
without help they default to the empty `public` schema and fail (`relation … does not exist`). The fix
is `tenancy/TenantTaskExecutor.kt`:

```kotlin
perClinic.forEachActiveClinic("task name") { /* work, runs once per ACTIVE clinic */ }
```

It iterates `registry.listActiveSchemas()`, runs the block under `TenantContext.withTenant(schema)` in
its **own tenant-scoped transaction**, and logs+continues if one clinic fails (one bad clinic never
stops the others). Used by `service/NoShowSweepJob.kt` and `service/PurgeJob.kt`. **Any new
`@Scheduled` job that touches clinic data must go through `TenantTaskExecutor`.**

---

## 8. Data model (per clinic)

Every clinic schema contains the same tables, defined in `db/tenant/V1__baseline.sql`:

`app_user`, `patient`, `appointment`, `visit`, `rx_row`, `rx_template`, `service`, `print_template`,
`clinic_schedule`, `chat_messages`, `chat_last_seen`, `patient_files`, `patient_ai_summary`,
`pharmacy_stock`, `migration_run`, `password_reset_token`, `audit_log`, `user_session`,
`patient_consent`, `data_subject_request`, `suggestion`, `clinic_settings`, `patient_deposit_ledger`,
`bill`.

Notes:
- There is **no `clinic_id` column** anywhere — the schema *is* the tenant boundary.
- `clinic_settings` holds the clinic's own configuration (one row), inside its schema.
- Security/compliance is folded into these tables (not separate services): `audit_log` (scoped to
  sensitive data — patient records + Rx; inventory auditing was intentionally dropped),
  `user_session` (carries `revoked_at` for logout/logout-all), `patient_consent`,
  `data_subject_request` (deletion/correction workflows).
- Billing: `bill` + `patient_deposit_ledger`, with `patient.deposit` and `visit.completed_at`.

Control plane (in `platform`): `clinic`, `clinic_provisioning`.

---

## 9. Local development

### 9.1 Subdomains on localhost

Plain `localhost` has no subdomain, so use one of:
- **`lvh.me`** — a public DNS name that resolves `*.lvh.me` → `127.0.0.1`. Visit
  `http://acme.lvh.me:3000`; both `tenant.ts` and `TenantResolutionFilter` understand `.lvh.me`.
- **`REACT_APP_DEV_TENANT`** — set in `frontend/.env.local` (gitignored) to hard-code the tenant when
  serving from plain `localhost:3000`. The interceptor then sends `X-Tenant: <that value>`.

A typical `frontend/.env.local`:
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_DEV_TENANT=tskin
```

### 9.2 Backend env

PostgreSQL at `jdbc:postgresql://localhost:5432/docodile` (user/pass `docodile`/`docodile` by
default; override with `SPRING_DATASOURCE_*`). **Required** env: `JWT_SECRET` (≥32 chars — the app
refuses to start without it), `POSTGRES_PASSWORD`. Optional: `ALLOWED_ORIGINS`, `FILE_ENCRYPTION_KEY`
(required in prod), `MAIL_*`, `JWT_EXPIRATION_MS`, `FRONTEND_URL`.

A schema must exist and be `ACTIVE` in `platform.clinic` for its subdomain to resolve. Until the
onboarding endpoint exists (backlog §1.1), provision dev clinics by calling
`ClinicProvisioningService.provision(...)` or by inserting the registry row + creating the schema +
running the tenant baseline by hand.

### 9.3 Commands

```
# backend
cd backend && ./gradlew test          # unit + Testcontainers tenancy tests
cd backend && ./gradlew bootRun       # run locally (needs Postgres + JWT_SECRET)

# frontend
cd frontend && CI=false npm run build  # production build (CI=false: warnings don't fail)
cd frontend && npx tsc --noEmit        # typecheck
cd frontend && npx eslint src --ext .ts,.tsx
```

---

## 10. Invariants & gotchas (don't break these)

1. **Never name a schema in application code.** Services/repositories must be tenant-agnostic. If you
   find yourself writing `acme.patient`, stop — set/route through `TenantContext` instead.
2. **Always pair `TenantContext.set()` with a `clear()`** (prefer `withTenant {}`). A leaked
   ThreadLocal cross-contaminates the next pooled request.
3. **All clinic-data DB access must flow through Hibernate/JPA** (so the connection provider sets
   `search_path`). The registry is the deliberate exception — plain JDBC, fully-qualified
   `platform.clinic`, because it lives outside tenants.
4. **Scheduled/background work → `TenantTaskExecutor.forEachActiveClinic`.** No request means no
   tenant; the default `public` schema is empty.
5. **JWTs are clinic-bound.** Keep the `schema` claim and the fail-closed check
   (`schema == TenantContext.get()`) intact. Don't "relax" it to fail-open.
6. **WebSocket: enforce tenancy on SUBSCRIBE, not just publish.** Per-name broker isolation is not
   tenant isolation.
7. **Change the tenant baseline, not `db/migration/`.** The latter is dead legacy.
8. **Schema names must pass `ClinicProvisioningService.slug()`** and only ever reach SQL as bound
   parameters. Don't add a path that interpolates a schema name into DDL/SQL text.
9. **Connection pool hygiene:** any code that manually `SET search_path` on a borrowed connection
   must `RESET` it in a `finally` before the connection is returned.

---

## 11. File map (multi-tenancy)

| Concern | File |
|--------|------|
| Tenant ThreadLocal | `tenancy/TenantContext.kt` |
| Subdomain → tenant (request filter) | `tenancy/TenantResolutionFilter.kt` (registered in `config/TenantFilterConfig.kt`) |
| Clinic registry (control plane DAO) | `tenancy/ClinicRegistry.kt` (`ClinicRegistryDao`, `ClinicRecord`, `ProvisioningStatus`) |
| Hibernate tenant resolver | `tenancy/SchemaTenantResolver.kt` |
| Hibernate connection provider (search_path) | `tenancy/SchemaMultiTenantConnectionProvider.kt` |
| Hibernate MT wiring | `config/MultiTenancyConfig.kt` |
| Programmatic Flyway | `tenancy/TenantMigrator.kt` |
| Boot migration runner | `tenancy/TenantBootMigrationRunner.kt` |
| Clinic provisioning | `tenancy/ClinicProvisioningService.kt` |
| Per-clinic-schema job runner | `tenancy/TenantTaskExecutor.kt` |
| JWT auth + tenant check | `security/JwtAuthenticationFilter.kt`, `security/TokenService.kt` |
| Spring Security + CORS | `config/SecurityConfig.kt` |
| WebSocket auth + subscribe isolation | `config/WebSocketSecurityConfig.kt`, `config/WebSocketConfig.kt` |
| Control-plane schema | `resources/db/control/V1__platform_schema.sql` |
| Per-clinic baseline | `resources/db/tenant/V1__baseline.sql` |
| Frontend tenant slug | `frontend/src/tenant.ts` |
| Frontend X-Tenant injection | `frontend/src/apiInterceptor.ts` (installed in `src/index.tsx`) |
